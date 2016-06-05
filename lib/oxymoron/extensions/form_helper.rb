module Oxymoron
  module ActionViewExtensions

    module FormHelperRewrite
      def form_for(record, options = {}, &block)
        raise ArgumentError, "Missing block" unless block_given?
        options[:html] ||= {}
        html_options = options[:html].with_indifferent_access

        case record
        when String, Symbol
          object_name = record
          object      = nil
        else
          object      = record.is_a?(Array) ? record.last : record
          raise ArgumentError, "First argument in form cannot contain nil or be empty" unless object
          object_name = options[:as] || model_name_from_record_or_class(object).param_key
          apply_form_for_options!(record, object, options)
        end

        html_options[:data]   = options.delete(:data)   if options.has_key?(:data)
        html_options[:remote] = options.delete(:remote) if options.has_key?(:remote)
        html_options[:method] = options.delete(:method) if options.has_key?(:method)
        html_options[:enforce_utf8] = options.delete(:enforce_utf8) if options.has_key?(:enforce_utf8)
        html_options[:authenticity_token] = options.delete(:authenticity_token)

        builder = instantiate_builder(object_name, object, options)
        output  = capture(builder, &block)
        html_options[:multipart] ||= builder.multipart?
        prefix = html_options["ng-submit-prefix"] || 'ctrl'
        html_options["ng-submit"] ||= "formQuery = #{prefix}.save({form_name: '#{object_name}', id: #{prefix}.#{object_name}.id, #{object_name}: #{prefix}.#{object_name}}); $event.preventDefault();"

        html_options[:name] ||= object_name

        html_options = html_options_for_form(options[:url] || {}, html_options)
        form_tag_with_body(html_options, output)
      end
    end


    module FormHelper

      def oxymoron_form_for(record, options = {}, &block)
        options[:builder] ||= Config.form_builder

        case record
        when String, Symbol
          object_name = record
        else
          object      = record.is_a?(Array) ? record.last : record
          raise ArgumentError, "First argument in form cannot contain nil or be empty" unless object
          object_name = options[:as] || model_name_from_record_or_class(object).param_key
        end

        html_options = options[:html] ||= {}
        html_options[:name] ||= object_name
        prefix = html_options["ng-submit-prefix"] || 'ctrl'
        html_options["ng-submit"] ||= "formQuery = #{prefix}.save({form_name: '#{object_name}', id: #{prefix}.#{object_name}.id, #{object_name}: #{prefix}.#{object_name}}); $event.preventDefault();"

        options[:html].merge!(html_options)
        form_for record, options, &block
      end

      def oxymoron_fields_for(record_name, record_object = nil, options = {}, &block)
        options[:builder] ||= Config.form_builder
        fields_for record_name, record_object, options, &block
      end

    end

    module FormBuilder

      def oxymoron_fields_for(record_name, record_object = nil, fields_options = {}, &block)
        options[:builder] ||= Config.form_builder
        fields_for record_name, record_object, fields_options, &block
      end

    end

  end
end

