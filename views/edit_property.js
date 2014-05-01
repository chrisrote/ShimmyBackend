'use strict'

var editProp = angular.module('editProp', ['angularFileUpload'])
		

function editPropController($scope, $http, $location, $upload, $rootScope, $routeParams, $route) {
	$scope.prop_id = myProp;
	$scope.property = {};

	$http.get('/api/propertyById/' + $scope.prop_id)
		.success(function(property) {
			$scope.property = property[0];
			console.log('scope property: ' + JSON.stringify($scope.property));
		})
		.error(function(err) {
			alert('We got an error: ' + err);
		});


	$scope.saveEdits = function() {
		console.log('saving edits...');
	};
}