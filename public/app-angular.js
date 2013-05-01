angular.module('app', ['ngResource']).factory('Task', function($resource) {
  return $resource('/tasks/:_id', {_id: '@_id'}, { update: { method: 'PUT' } } )
});

function TodoController($scope, Task, $filter) {

  var filter = $filter('filter');

  $scope.tasks = Task.query()

  $scope.searchTask = ''

  $scope.newTask = '';
  $scope.editedTask = null;

  $scope.taskOrder = 'created_at'
  $scope.taskOrderReverse = false

  $scope.createTask = function() {
    var task = new Task({description: $scope.newTask})
    task.$save()
    $scope.tasks.push(task)
    $scope.newTask = ''
  }

  $scope.editTask = function(task) {
    $scope.editedTask = task
  };

  $scope.saveTask = function(task) {
    task.$update()
    $scope.editedTask = null
  };

  $scope.setOrder = function(order) {
    if (order == $scope.taskOrder) {
      $scope.taskOrderReverse = !$scope.taskOrderReverse
    } else {
      $scope.taskOrder = order
      $scope.taskOrderReverse = false
    }
  }

  $scope.removeTask = function(task) {
    task.$delete()
    $scope.tasks.splice($scope.tasks.indexOf(task), 1);
  }

  $scope.removeAllCompleted = function() {
    angular.forEach($scope.completedTasks(), function(task) {
      $scope.removeTask(task)
    })
  }

  $scope.incompleteTasks = function() {
    return filter($scope.tasks, {complete: false})
  }

  $scope.completedTasks = function() {
    return filter($scope.tasks, {complete: true})
  }
}

