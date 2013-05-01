require 'fileutils'
pwd = FileUtils.pwd
FileUtils.mkdir_p("#{pwd}/tmp/pids")
FileUtils.mkdir_p("#{pwd}/log")

worker_processes 2
listen            "#{pwd}/tmp/pids/unicorn.sock"
working_directory pwd
pid               "#{pwd}/tmp/pids/unicorn.pid"
stderr_path       "#{pwd}/log/application.log"
stdout_path       "#{pwd}/log/application.log"
#
