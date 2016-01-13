require File.expand_path('../lib/oxymoron/version', __FILE__)

Gem::Specification.new do |gem|
  gem.name          = "oxymoron" 
  gem.authors       = ["Kononenko Paul"]
  gem.email         = ["storuky@gmail.com"]
  gem.description   = "Lol"
  gem.summary       = "Lal"

  gem.version       = Oxymoron::VERSION
  gem.files         = `git ls-files`.split("\n")
  gem.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  gem.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  gem.require_paths = ["lib"]

  gem.required_ruby_version = '>= 1.9.3'


  gem.add_runtime_dependency "awesome_print"
  gem.add_runtime_dependency 'pry'
  gem.add_runtime_dependency 'pry-remote'
  gem.add_runtime_dependency 'pry-rails'
  gem.add_runtime_dependency 'pry-stack_explorer'
end