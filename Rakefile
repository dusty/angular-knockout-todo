desc "Run app in foreground"
task :run do
  sh "bundle exec unicorn"
end

desc "Start app IRB session"
task :shell do
  sh "bundle exec irb -r ./init"
end

desc "Start app server"
task :start do
  if running?
    puts "Unicorn running: #{pid}"
  else
    sh "bundle exec unicorn -D -c ./config/unicorn.rb"
    puts "Unicorn started: #{pid}"
  end
end

desc "Stop app server"
task :stop do
  if running?
    Process.kill("TERM", pid)
    FileUtils.rm(pidfile)
    puts "Unicorn stopped"
  else
    puts "Pidfile not found"
  end
end

desc 'Restart app server'
task :restart do
  if running?
    Process.kill("HUP", pid)
    puts "Unicorn restarted: #{pid}"
  else
    Rake::Task["start"].invoke
  end
end

desc 'Status of app server'
task :status do
  puts running? ? "Unicorn running: #{pid}" : "Unicorn stopped:"
end

desc "Start app IRB session"
task :shell do
  sh "bundle exec irb -r ./init"
end

def pidfile
  "./tmp/pids/unicorn.pid"
end

def pid
  File.read(pidfile).to_i if File.exists?(pidfile)
end

def running?
  begin
    raise(StandardError, "PID not found") unless pid
    Process.kill(0, pid) && true
  rescue StandardError => e
    false
  end
end
