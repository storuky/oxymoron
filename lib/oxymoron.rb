if defined?(::Rails)
  require "oxymoron/engine"
end

module Oxymoron
  class Oxymoron

    class << self
      def render_oxymoron_assets asset_name
        html = File.open("#{Gem.loaded_specs['oxymoron'].full_gem_path}/app/assets/javascripts/oxymoron/#{asset_name}").read
        template = ERB.new(html, nil, "%")
        template.result(binding)
      end

      def generate
        Rails.application.reload_routes!

        @routes = {}
        @states = {}
        @resources = {}

        routes = Rails.application.routes.routes.select{|route| route.name.present? && route.constraints[:request_method]}
        routes_by_controller = routes.select{|route| ['new', 'edit', 'show', 'index'].exclude?(route.defaults[:action])}.group_by{|route| route.defaults[:controller]}.delete_if {|k,v| k.nil?}

        routes.each do |route|
          route_name = route.name
          path = route.path.spec.to_s.gsub('(.:format)', '')
          url_matcher = "'#{path}'"

          route.path.required_names.each do |required_name|
            if requirement = route.requirements[required_name.to_sym]
              if requirement.is_a? Regexp
                requirement = requirement.to_s[7..-2]
              end
              url_matcher = path.gsub(':'+required_name, "{#{required_name}:(?:#{requirement})}")
              url_matcher = "$urlMatcherFactoryProvider.compile(\"#{url_matcher}\")"
            end
          end
          @routes[route_name] = {defaults: (route.defaults[:params] || {}), path: path}

          if route.constraints[:request_method].match("GET")
            @states[route_name] = {
              url: url_matcher,
              templateUrl: path,
              cache: route.defaults[:cache] === false ? false : true
            }
            
            if route.defaults[:controller]
              @states[route_name][:controller] = "#{route.defaults[:controller].camelize.gsub('::', '')}Ctrl as ctrl"
              @states[route_name][:action] = route.defaults[:action]
            end

            if route.defaults[:action] == 'show'
              @resources[route_name.camelize] = {
                url: path,
                default_params: Hash[route.path.required_names.map{|name| [name, '@'+name]}]
              }

              for_hash = {
                'new'     => {method: 'GET', url: "#{path}/new.json" },
                'edit'    => {method: 'GET', url: "#{path}/edit.json"},
                'update'  => {method: 'PUT'},
                'create'  => {method: 'POST'},
                'destroy' => {method: 'DELETE'}
              }

              if route_by_controller = routes_by_controller[route.defaults[:controller]]
                routes_by_controller[route.defaults[:controller]].each do |route|
                  # if route.defaults[:controller] == "spa/comments"
                  #   rn = route.defaults[:controller].gsub('/', '_')
                  #   if route_name != rn
                  #     # ap "#{route_name.camelize} => #{rn.camelize}"
                  #     # ap path
                  #   end
                  #   ap "#{route.name} => #{route.defaults[:controller]} ON #{route.defaults[:action]}"
                  # end

                  base_path = path.gsub(/:(\w)+/, '').gsub(/\(.*$/, '').gsub('//', '/')
                  this_route_path = route.path.spec.to_s.gsub(/:(\w)+/, '').gsub(/\(.*$/, '').gsub('//', '/')

                  if (this_route_path.start_with?(base_path))
                    for_hash[route.defaults[:action]] ||= {
                      url: route.path.spec.to_s.gsub('(.:format)', '.json'),
                      isArray: route.defaults[:is_array],
                      method: /GET|POST|PUT|PATCH|DELETE/.match(route.constraints[:request_method].to_s).to_s
                    }
                  end
                  
                end
              end
              
              @resources[route_name.camelize][:actions] = for_hash
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