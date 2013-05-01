## Bundler
require "rubygems"
require "bundler/setup"

## Require gems
%w{ sinatra mongoid }.each {|r| require r}

## Connect to MongoDB
Mongoid.load!('./config/mongodb.yml')

## Custom Libraries
Dir["./lib/*.rb"].sort.each {|req| require req}
