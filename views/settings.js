
var landlord_settings = angular.module('landlord_settings', []);

function editLandlordController($scope, $http) {
	$scope.landlord_id = my_landlord;
	$scope.landlord = {};

	$http.get('/api/landlord/:landlord_id' + $scope.landlord_id)
		.success(function(data) {
			$scope.landlord = data;
			console.log('success: ' + JSON.stringify($scope.landlord));
		})
		.error(function(err){
			console.log('got err: ' + JSON.stringify(err));
		});

	$scope.saveChanges = function() {

	};
}