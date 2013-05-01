require './init'
STDOUT.sync = true
STDERR.sync = true

run Sinatra::Application
