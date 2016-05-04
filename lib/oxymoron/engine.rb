require 'oxymoron/concern'

module Oxymoron
  class Engine < ::Rails::Engine

    initializer 'oxymoron.dependent_on_routes', after: "sprockets.environment" do
      Rails.application.config.after_initialize do
        ROUTES_PATH = Rails.root.join('app', 'assets', 'javascripts', 'oxymoron.js').to_s
        routes_watch unless Rails.env.production?
        File.write(ROUTES_PATH, Oxymoron.generate)
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
          File.write(ROUTES_PATH, Oxymoron.generate)
        end

        ActionDispatch::Reloader.to_prepare do
          oxymoron_reloader.execute_if_updated
        end
      end
  end
end