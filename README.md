# Oxymoron

##Установка

Добавьте гем в Gemfile:

```
gem "oxymoron", git: "https://github.com/storuky/oxymoron.git", branch: :master
```

## Первичные настройки (Asset Pipeline)

Подключите зависимости внутри application.js и application.css

**application.js**
```
/*
= require oxymoron/angular
= require oxymoron/angular-resource
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

##Использование

Далее необходимо заинжектить 'oxymoron' и 'ui.router' в ваше AngularJS-приложение

**application.js**
```
angular.module('app', ['ui.router', 'oxymoron'])
```

Создайте файл routes.js, который будет содержать роуты приложение. Метод $stateProvider.rails() дублирует роутинг рельсового routes.rb.

**routes.js**
```
angular.module('app')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.rails()
  }])
```

В applicaiton_controller.rb необходимо выключать лейаут, если была запрошена страница посредством ajax-запроса.

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
    # В продуктовом режиме следует прописать эту строчку в initializers/oxymoron.rb
    ActionView::Base.default_form_builder = OxymoronBuilder
  end
end
```

Отредактируйте ваш лейаут, изменив

**app/views/layouts/application**
```
= yield
```
на
```
ui-view
```
или для СЕО-френдли на
```
ui-view
  div[ng-non-bindable]
    = yield
```


Все методы CRUD должны быть обернуты внутрь respond_to

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

Oxymoron добавляет некоторую функциональность для вашего AngularJS-приложения. В частности, нам становятся доступны фабрики-ресурсы имя которых соответствует имени вашей модели в Rails-приложении. В нашем случае это фабрика Post.

**Доступны следующие методы для работы с ресурсами:**
```
Post.query() // => GET /posts.json
Post.get({id: id}) // => GET /posts/:id.json
Post.new() // => GET /posts/:id/new.json
Post.edit({id: id}) // => GET /posts/:id/edit.json
Post.create({post: post}) // => POST /posts.json
Post.update({id: id, post: post}) // => PUT /posts/:id.json
Post.destroy({id: id}) // => DELETE /posts/:id.json
```

Создайте AngularJS-контроллер "PostsCtrl"

**Пример:**

```
angular.module('app')
  .controller('PostsCtrl', ['Post', 'action', function (Post, action) {
    var ctrl = this;
    
    // Данный код вызовется только на странице '/posts'
    action('index', function(){
      ctrl.posts = Post.query();
    });
    
    // Вызовется на страницах соответсующих паттерну '/posts/:id'
    action('show', function (params){
      ctrl.post = Post.get({id: params.id});
    });
    
    // Вызовется на '/posts/new'
    action('new', function(){
      ctrl.post = Post.new();
      ctrl.save = Post.create;
    });
    
    // Вызовется на '/posts/:id/edit'
    action('edit', function (params){
      ctrl.post = Post.edit({id: params.id});
      ctrl.save = Post.update;
    })
    
    // Вызовется на двух страницах
    action(['edit', 'new'], function(){
      //
    })
    
    // Вызовется на '/posts/some_method'
    action('some_method', function(){
      //
    })
    
    // etc
  }])
```

##Пример Views
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

Для задания ссылок используйте аттрибут ui-sref, как это описано в документации
```
a ui-sref="posts_path" Все посты
a ui-sref="new_post_path" Новый пост
a ui-sref="edit_post_path({id: id})" Редактировать пост
a ui-sref="post_path({id: id})" Просмотр поста
```

##Дополнительно
В window вам доступна переменная Routes, в которой хранятся все роуты приложения.

**Например**
```
Routes.posts_path() //=> '/posts'
Routes.post_path({id: 1}) //=> '/posts/1'
Routes.post_path({id: 1, format: "json"}) //=> '/posts/1.json'
Routes.posts_url() //=> 'http://localhost:3000/posts'
```
Старайтесть избегать использование Routes для составления ajax-запросов на методы ресурсов.

Если ожидается, что ваш метод, определенный на ресурсе возвращает массив, то необходимо сделать соответстующую пометку

```
resources :posts do
  get 'my', is_array: true
end
```

Тогда выполнив метод Post.my() внутри вашего AngularJS-контроллера, вы получите данные в виде массива. В противном случае, AngularJS выкинет исключение.

Приятного кодинга:)
