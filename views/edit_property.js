'use strict'

var editProp = angular.module('editProp', ['angularFileUpload'])
		

function editPropController($scope, $http, $window) {
	$scope.prop_id = myProp;
	$scope.property = {};

	$http.get('/api/propertyById/' + $scope.prop_id)
		.success(function(property) {
			$scope.property = property[0];
		})
		.error(function(err) {
			alert('We got an error: ' + err);
		});


	$scope.saveEdits = function() {
		console.log('saving edits: ' + JSON.stringify($scope.property));
		$http.put('/api/updateProperty', $scope.property)
			.success(function(property) {
				console.log('got a prop back: ' + JSON.stringify(property));
				$window.location.href = '/profile';	
			})
			.error(function(err) {
				alert('we got an error: ' + JSON.stringify(err));
			})
	};

	$scope.cancel = function() {
		$window.location.href = '/profile';	
	};
}