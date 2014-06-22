var profile = angular.module('profile.controllers', ['ui.bootstrap']);


profile.directive('propertyRow', function() {
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


profile.controller('profileController', ['$scope', '$http', '$window', '$rootScope', '$modal', function($scope, $http, $window, $rootScope, $modal){
	var landlord_id = my_user;
	$scope.landlord_id = landlord_id
	$scope.idToDelete;

	$scope.showPropJunctions = function(landlord_id, prop_id) {
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

	$scope.showDeleteAlert = function(prop_id) {
		$scope.idToDelete = prop_id;

		var modalInstance = $modal.open({
	      	templateUrl: 'deleteContent.html',
	      	controller: ModalInstanceCtrl,
	      	resolve: {
	        	items: function () {
	          		return $scope.items;
	        	}
	      	}
	    });

	    modalInstance.result.then(function (selectedItem) {
			$http.delete('/api/property/' + $scope.idToDelete)
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
		    }, function () {
				console.log('called when cancel pressed')	
		    });
	};
}]);


var ModalInstanceCtrl = function ($scope, $modalInstance) {
  	$scope.delete = function () {
  		$modalInstance.close();
  	};

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
