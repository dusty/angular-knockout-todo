// taken from http://todomvc.com/architecture-examples/knockoutjs/
var ENTER_KEY = 13;
// a custom binding to handle the enter key (could go in a separate library)
ko.bindingHandlers.enterKey = {
  init: function (element, valueAccessor, allBindingsAccessor, data) {
    var wrappedHandler, newValueAccessor;

    // wrap the handler with a check for the enter key
    wrappedHandler = function (data, event) {
      if (event.keyCode === ENTER_KEY) {
        valueAccessor().call(this, data, event);
      }
    };

    // create a valueAccessor with the options that we would want to pass to the event binding
    newValueAccessor = function () {
      return {
        keyup: wrappedHandler
      };
    };

    // call the real event binding's init function
    ko.bindingHandlers.event.init(element, newValueAccessor, allBindingsAccessor, data);
  }
};

// wrapper to hasfocus that also selects text and applies focus async
ko.bindingHandlers.selectAndFocus = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    ko.bindingHandlers.hasfocus.init(element, valueAccessor, allBindingsAccessor);
    ko.utils.registerEventHandler(element, 'focus', function () {
      element.focus();
      element.select();
    });
  },
  update: function (element, valueAccessor) {
    ko.utils.unwrapObservable(valueAccessor()); // for dependency
    // ensure that element is visible before trying to focus
    setTimeout(function () {
      ko.bindingHandlers.hasfocus.update(element, valueAccessor);
    }, 0);
  }
}


// App code

function Task(data) {
  this.description = ko.observable()
  this.complete = ko.observable()
  this.created_at = ko.observable()
  this.updated_at = ko.observable()
  this._id = ko.observable()
  this.isvisible = ko.observable(true);
  this.editing = ko.observable(false);

  this.update = function(data) {
    if (data) {
      this.description(data.description)
      this.complete(data.complete)
      this.created_at(data.created_at)
      this.updated_at(data.updated_at)
      this._id(data._id)
    }
  }
  this.update(data)
}

function TaskViewModel() {
  var self = this
  self.tasks = ko.observableArray([])
  self.newTaskDesc = ko.observable()
  self.query = ko.observable('');


  self.search = function(task){
    ko.utils.arrayForEach(self.tasks(), function(task){
      if (task.description() && self.query() != ""){
        task.isvisible(task.description().toLowerCase().indexOf(self.query().toLowerCase()) >= 0);
      } else if (self.query() == "") {
        task.isvisible(true);
      } else {
        task.isvisible(false);
      }
    })
    return true;
  }

  self.getTasks = function() {
    $.ajax({
      url: "/tasks",
      dataType: 'json',
      success: function(data) {
        var tasks = $.map(data, function(item) { return new Task(item) })
        self.tasks(tasks)
      },
      error: function(data) {
        alert(data.responseText)
      }
    })
  }

  self.addTask = function() {
    var task = new Task({ description: this.newTaskDesc() })
    $.ajax({
      url: "/tasks",
      type: "POST",
      dataType: 'json',
      data: ko.toJSON(task),
      success: function(data) {
        self.tasks.push(new Task(data))
        self.newTaskDesc("")
      },
      error: function(data) {
        alert(data.responseText)
      }
    })
  }

  self.updateTask = function(task) {
    $.ajax({
      url: "/tasks/" + task._id(),
      type: "PUT",
      dataType: 'json',
      data: ko.toJSON(task),
      success: function(data) {
        task.update(data)
      },
      error: function(data) {
        alert(data.responseText)
      }
    })
  }

  self.destroyTask = function(task) {
    $.ajax({
      url: "/tasks/" + task._id(),
      type: "DELETE",
      dataType: 'json',
      success: function(data) {
        self.tasks.destroy(task)
      },
      error: function(data) {
        alert(data.responseText)
      }
    })
  }

  self.completeTasks = ko.computed(function() {
    return ko.utils.arrayFilter(self.tasks(), function(task) { return (task.complete() && !task._destroy) })
  })

  self.incompleteTasks = ko.computed(function() {
    return ko.utils.arrayFilter(self.tasks(), function(task) { return (!task.complete() && !task._destroy) })
  });

  self.toggleComplete = function(task) {
    (task.complete()) ? task.complete(true) : task.complete(false)
    self.updateTask(task)
    return true
  }

  self.removeAllComplete = function() {
    ko.utils.arrayForEach(self.tasks(), function(task){
      if (task.complete()) { self.destroyTask(task) }
    })
  }

  self.formatDate = function(dateString) {
    var date  = new Date(dateString);
    var year  = date.getFullYear()
    var month = ("0" + (date.getMonth() + 1)).slice(-2)
    var day   = ("0" + date.getDate()).slice(-2)
    var hour  = ("0" + date.getHours()).slice(-2)
    var min   = ("0" + date.getMinutes()).slice(-2)
    var sec   = ("0" + date.getSeconds()).slice(-2)
    return [year, month, day].join('/') + " " + [hour, min, sec].join(':')
  }

  self.sortedBy = []

  self.sort = function(field){
    if (self.sortedBy.length && self.sortedBy[0] == field && self.sortedBy[1]==1){
      self.sortedBy[1]=0;
      self.tasks.sort(function(first,next){
        if (!next[field].call()){ return 1; }
        return (next[field].call() < first[field].call()) ? 1 : (next[field].call() == first[field].call()) ? 0 : -1;
      });
    } else {
      self.sortedBy[0] = field;
      self.sortedBy[1] = 1;
      self.tasks.sort(function(first,next){
        if (!first[field].call()){ return 1; }
        return (first[field].call() < next[field].call()) ? 1 : (first[field].call() == next[field].call()) ? 0 : -1;
      });
    }
  }

  self.editItem = function(item) {
    item.editing(true)
  }

  self.stopEditing = function(item, event) {
    // blur event will be called after this
    // avoid duplicate updates
    if (event.keyCode === ENTER_KEY) {
      item.editing(false)
    } else {
      self.updateTask(item)
      item.editing(false);
    }
  };

  self.getTasks()
}

ko.applyBindings(new TaskViewModel())
