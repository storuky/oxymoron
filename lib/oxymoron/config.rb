module Oxymoron

  class Config
    class << self

      attr_accessor :oxymoron_js_path
      attr_accessor :rewrite_form_for
      attr_accessor :form_builder

      def setup
        yield self
      end

    end
    @rewrite_form_for = true
    @form_builder = OxymoronFormBuilder

  end

end