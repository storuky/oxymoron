if defined?(::Rails)
  require "oxymoron/engine"
end

module Oxymoron
  class Oxymoron
    class << self
      def generate
        Rails.application.reload_routes!

        @routes = {}
        @states = {}
        @resources = {}

        routes = Rails.application.routes.routes.select{|route| route.name.present? && route.constraints[:request_method]}
        routes_by_controller = routes.select{|route| ['new', 'edit', 'show', 'index'].exclude?(route.defaults[:action])}.group_by{|route| route.defaults[:controller]}.delete_if {|k,v| k.nil?}

        routes.each do |route|
          path = route.path.spec.to_s.gsub('(.:format)', '')
          @routes[route.name] = {defaults: (route.defaults[:params] || {}), path: path}

          if route.constraints[:request_method].match("GET")
            @states[route.name] = {
              url: path,
              templateUrl: path,
              cache: route.defaults[:cache] === false ? false : true
            }
            
            if route.defaults[:controller]
              @states[route.name][:controller] = "#{route.defaults[:controller].camelize.gsub('::', '')}Ctrl as ctrl"
              @states[route.name][:action] = route.defaults[:action]
            end

            if route.defaults[:action] == 'show'
              @resources[route.name.camelize] = {
                url: path,
                default_params: Hash[route.path.required_names.map{|name| [name, '@'+name]}]
              }

              for_hash = [
                ['new', {method: 'GET', url: "#{path}/new.json" }],
                ['edit', {method: 'GET', url: "#{path}/edit.json"}],
                ['update', {method: 'PUT'}],
                ['create', {method: 'POST'}],
                ['destroy', {method: 'DELETE'}]
              ]

              if route_by_controller = routes_by_controller[route.defaults[:controller]]
                for_hash += routes_by_controller[route.defaults[:controller]].map do |route|
                  [route.defaults[:action], {
                    url: route.path.spec.to_s.gsub('(.:format)', '.json'),
                    isArray: route.defaults[:is_array],
                    method: /GET|POST|PUT|PATCH|DELETE/.match(route.constraints[:request_method].to_s).to_s
                  }]
                end
              end
              
              @resources[route.name.camelize][:actions] = Hash[for_hash]
            end
          end
        end

        template = ERB.new File.new(File.expand_path('../oxymoron/oxymoron.js.erb', __FILE__)).read, nil, "%"

        if Rails.env.production?
          return Uglifier.new.compile(template.result(binding))
        else
          return template.result(binding)
        end
      end
    end
  end

end