module Oxymoron

  class Config
    class << self

      attr_accessor :oxymoron_js_path

      def setup
        yield self
      end

    end
  end

end