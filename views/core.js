var shimmy = angular.module('shimmy', []);
console.log('loading shimmy core.js');

function mainController($scope, $http) {
	$scope.formData = {};

	// when landing on the page, get all property and show them
	$http.get('/api/property')
		.success(function(data) {
			$scope.properties = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.createProperty = function(isValid) {

		if(isValid) {
			$http.post('/api/property', $scope.formData)
			.success(function(data){
				$scope.formData = {};	// Clear the form to the user can input another
				$scope.properties = data;
				alert('Property submitted successfully.');
			})
			.error(function(data){
                alert('we got an error: ' + data);
				console.log('Error: ' + data);
			});
		} else {
			alert('Please enter all required values.');	
		}
	};
}