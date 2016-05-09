require 'oxymoron/concern'

module Oxymoron
  class Engine < ::Rails::Engine

    initializer 'oxymoron.dependent_on_routes', after: "sprockets.environment" do
      Rails.application.config.after_initialize do
        JS_ASSETS_PATH = Rails.root.join('app', 'assets', 'javascripts')
        routes_watch unless Rails.env.production?
        write_assets
      end
    end

    initializer 'oxymoron.csrf' do |app|
      ActiveSupport.on_load(:action_controller) do
        include ::Oxymoron::Concern
      end
    end

    private
      def routes_watch
        oxymoron_reloader = ActiveSupport::FileUpdateChecker.new(Dir["#{Rails.root}/config/routes.rb"]) do
          write_assets
        end

        ActionDispatch::Reloader.to_prepare do
          oxymoron_reloader.execute_if_updated
        end
      end

      def write_assets
        File.write(JS_ASSETS_PATH.join("oxymoron.js"), Oxymoron.generate("oxymoron.js.erb"))
      end
  end
end