var profile = angular.module('profile.controllers', []);


profile.directive('propertyRow', function() {
	console.log('loading directive');
	return {
      	restrict: 'AE',
      	replace: true,
      	transclude: false,
      	templateUrl: 'directives/propRow.ejs',
      	scope: {},
      	link : function(scope, element, attrs) {
      		element.bind('click', function() {
      			console.log('clicked a property');
      		});
      	},
      	controller: function($scope) {
      		$.get('/api/getPropsByLandlord/' + my_user)
				.success(function(data) {
					$scope.$apply(function () {
					    $scope.properties = data;
					});
				})
				.error(function(err){	
					console.log('error getting props by landlord');
				});
      	}
  	};
});


profile.controller('profileController', ['$scope', '$http', '$window', '$rootScope', function($scope, $http, $window, $rootScope){
	var landlord_id = my_user;
	$scope.landlord_id = landlord_id

	$scope.showProp = function(landlord_id, prop_id) {
		$http.get('/api/getPropJunctionsForLandlord/' + landlord_id + '/' + prop_id)
			.success(function(data){
				console.log('got success: ' + JSON.stringify(data));
			})
			.error(function(err){
				console.log('got error: ' + JSON.stringify(err));
			});
	};

	$scope.editProperty = function(prop_id) {
		$window.location.href = '/edit_property/' + prop_id;
	};

	$scope.deleteProperty = function(prop_id) {
		$http.delete('/api/property/' + prop_id)
			.success(function(data) {
				$http.get('/api/getPropsByLandlord/' + landlord_id)
					.success(function(data) {
						console.log('success getting props: ' + JSON.stringify(data));
						$scope.properties = data;
					})
					.error(function(err){	
						console.log('error getting props by landlord');
					});
			})
			.error(function(err){
				console.log('got err: ' + err);
			});
	};
}]);