# Oxymoron

[Example application](https://github.com/storuky/oxymoron_app)

[Basic forum based on Oxymoron](https://github.com/storuky/forum)
##Setup

Add it to your Gemfile:

```
gem 'oxymoron'
```

## Basic settings (Asset Pipeline)

Add dependencies to your application.js and application.css

**application.js**
```
/*
= require oxymoron/angular
= require oxymoron/angular-resource
= require oxymoron/angular-cookies
= require oxymoron/angular-ui-router
= require oxymoron/ng-notify
= require oxymoron
*/
```

**application.css**
```
/*
 *= require oxymoron/ng-notify
 */
```

## Advanced settings


**config/initializers/oxymoron.rb**
```
Oxymoron::Config.setup do |c|
  # change path for generated oxymoron.js
  c.oxymoron_js_path = Rails.root.join('app', 'assets', 'javascripts', 'public') 
  
  # Change form builder. By default used OxymoronFormBuilder
  c.form_builder = MyFormBuilder 
  
  # Disabled rewrite form_for method in ActionView::FormHelper. In this case use helpers oxymoron_form_for and oxymoron_field_for
  c.rewrite_form_for = false 
end
```

##Usage

Next, you need to inject required modules 'oxymoron' and 'ui.router'

**application.js**
```
angular.module('app', ['ui.router', 'oxymoron'])
```

Create file routes.js, which will contain the application SPA-routings. Method $stateProvider.rails() transform routes.rb to Angular UI Router states.

**routes.js**
```
angular.module('app')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.rails()
  }])
```

Disable layouts for all ajax query:

**app/controllers/application_controller.rb**
```
class ApplicationController < ActionController::Base
  layout proc {
    if request.xhr?
      false
    else
      index
      'application' # или другой лейаут
    end
  }
  
  private
  def index
    # In the production mode write this string into initializers/oxymoron.rb
    ActionView::Base.default_form_builder = OxymoronBuilder
  end
end
```

Edit your layout with ui-view notation:

**app/views/layouts/application**
```
= yield
```
to
```
ui-view
```
or for SEO-friendly
```
ui-view
  div[ng-non-bindable]
    = yield
```


All controllers methods must be wrapped with respond_to

**Example:**
```
class PostsController < ActiveRecord::Base
  before_action :set_post, only: [:show, :update, :destroy]

  def index
    respond_to do |format|
      format.html
      format.json {
        @posts = Post.all
        render json: @posts
      }
    end
  end
  
  def show
    respond_to do |format|
      format.html
      format.json {
        render json: @post
      }
    end
  end
  
  def new
  end
  
  def edit
  end
  
  def create
    respond_to do |format|
      format.json {
        @post = Post.new post_params
        if @post.save
          render json: {post: @post, msg: "Post successfully created", redirect_to: "posts_path"}
        else
          render json: {errors: @post.errors, msg: @post.errors.full_messages.join(', ')}, status: 422
        end
      }
    end
  end

  def update
    respond_to do |format|
      format.json {
        if @post.update(post_params)
          render json: {post: @post, msg: "Post successfully updated", redirect_to: "posts_path"}
        else
          render json: {errors: @post.errors, msg: @post.errors.full_messages.join(', ')}, status: 422
        end
      }
    end
  end

  def destroy
    respond_to do |format|
      format.json {
        @post.destroy
        render json: {msg: "Post successfully deleted"}
      }
    end
  end
  
  private
    def set_post
      @post = Post.find(params[:id])
    end
    
    def post_params
      params.require(:post).permit(:title, :description, :author)
    end
end
```

Oxymoron add some functionality for your AngularJS application. You can use *factory* whose name matches the name of your resources routes.rb. Do not forget to inject it, when it's required.
In our case it is Post resource.

```
Post.query() // => GET /posts.json
Post.get({id: id}) // => GET /posts/:id.json
Post.new() // => GET /posts/new.json
Post.edit({id: id}) // => GET /posts/:id/edit.json
Post.create({post: post}) // => POST /posts.json
Post.update({id: id, post: post}) // => PUT /posts/:id.json
Post.destroy({id: id}) // => DELETE /posts/:id.json
```

Add AngularJS-controller "PostsCtrl"

**Example:**

```
angular.module('app')
  .controller('PostsCtrl', ['Post', 'action', function (Post, action) {
    var ctrl = this;
    
    // Called only on '/posts'
    action('index', function(){
      ctrl.posts = Post.query();
    });
    
    // Called only for '/posts/:id'
    action('show', function (params){
      ctrl.post = Post.get({id: params.id});
    });
    
    // Called only on '/posts/new'
    action('new', function(){
      ctrl.post = Post.new();
      ctrl.save = Post.create;
    });
    
    // Called only for '/posts/:id/edit'
    action('edit', function (params){
      ctrl.post = Post.edit({id: params.id});
      ctrl.save = Post.update;
    })
    
    // Called only for '/posts/:id/edit' or '/posts/new'
    action(['edit', 'new'], function(){
      //
    })
    
    // Called only for your custom resource method. For example: '/posts/some_method'
    action('some_method', function(){
      //
    })
    
    // etc
  }])
```

##Example Views
**posts/index.html.slim**

```
h1 Posts

input type="text" ng-model="search"

table
  thead
    tr
      th Date
      th Title
      th Author
  tbody
    tr ng-repeat="post in ctrl.posts | filter:search"
      td
        | {{post.created_at | date:"dd.MM.yyyy"}}
      td
        | {{post.title}}
      td
        | {{post.author}}
```

**posts/show.html.slim**
```
dl
  dl Date
  dd
    | {{ctrl.post.created_at | date:"dd.MM.yyyy"}}
  dl Title
  dd
    | {{ctrl.post.title}}
  dl author
  dd
    | {{ctrl.post.author}}
```

**posts/new.html.slim**
```
h1 New post

= render 'form'
```

**posts/edit.html.slim**
```
h1 Edit post

= render 'form'
```

**posts/_form.html.slim**
```
= form_for Post.new do |f|
  div
    = f.label :title
    = f.text_field :title
  div
    = f.label :description
    = f.text_area :description
  
  = f.submit "Save"
  
```

Use *ui-sref* insted of link_to helper
```
a ui-sref="posts_path" All posts
a ui-sref="new_post_path" New post
a ui-sref="edit_post_path({id: id})" Edit post
a ui-sref="post_path({id: id})" Show
```

##Routes
In window you can find *Routes* variable, which contains all routes of your app (such as JsRoutes).

**Example**
```
Routes.posts_path() //=> '/posts'
Routes.post_path({id: 1}) //=> '/posts/1'
Routes.post_path({id: 1, format: "json"}) //=> '/posts/1.json'
Routes.posts_url() //=> 'http://localhost:3000/posts'
```
If your expect that your controller method return an array, you must mark this routes with *is_array* property. If you do not, it throw an exception from angular.
```
resources :posts do
  get 'my', is_array: true
end
```

Happy coding :)
