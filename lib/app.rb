before do
  content_type 'application/json'
end

error do
  json_error
end

not_found do
  halt(404, "Not Found")
end

helpers do
  def json_success(data="Ok")
    halt(200, data.to_json)
  end

  def json_error(data="Error")
    message = data.respond_to?(:errors) ? data.errors.full_messages.first : data
    halt(503, message)
  end
end

get "/" do
   content_type :html
   erb :index
end

get "/knockout" do
  content_type :html
  erb :knockout
end

get "/angular" do
  content_type :html
  erb :angular
end

get "/tasks" do
  puts params
  json_success(Task.all)
end

post "/tasks" do
  json = JSON.parse(request.body.read)
  task = Task.new(json)
  task.save ? json_success(task) : json_error(task)
end

put "/tasks/:id" do
  not_found unless task = Task.find(params[:id])
  json = JSON.parse(request.body.read)
  task.complete = json["complete"]
  task.description = json["description"]
  task.save ? json_success(task) : json_error(task)
end

delete "/tasks/:id" do
  puts "****\n#{params}\n****\n"
  not_found unless task = Task.find(params[:id])
  task = Task.find(params[:id])
  task.destroy ? json_success : json_error(task)
end
