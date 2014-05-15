
var selectProp = angular.module('selectProp', []);

function selectPropController($scope, $http, $window) {
	var landlord_id = my_user;
	$scope.properties = [];
	$scope.landlord_id = landlord_id

	$http.get('/api/getPropsByLandlord/' + landlord_id)
		.success(function(data) {
			console.log('success getting props: ' + JSON.stringify(data));
			$scope.properties = data;
		})
		.error(function(err){	
			console.log('error getting props by landlord');
		});

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
		console.log('editing prop with id: ' + prop_id);
		$window.location.href = '/edit_property/' + prop_id;
	};

	$scope.deleteProperty = function(prop_id) {
		console.log('deleting prop: ' + prop_id);
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

}