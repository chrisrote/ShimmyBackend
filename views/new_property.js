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
	$scope.createProperty = function() {
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
	};
}

// directive that prevents submit if there are still form errors
shimmy.directive('validSubmit', [ '$parse', function($parse) {
		return {
			// we need a form controller to be on the same element as this directive
			// in other words: this directive can only be used on a form
			require: 'form',
			// one time action per form
			link: function(scope, element, iAttrs, form) {
				form.$submitted = false;
				// get a hold of the function that handles submission when form is valid
				var fn = $parse(iAttrs.validSubmit);
				
				// register DOM event handler and wire into Angular's lifecycle with scope.$apply
				element.on('submit', function(event) {
					scope.$apply(function() {
						// on submit event, set submitted to true (like the previous trick)
						form.$submitted = true;
						// if form is valid, execute the submission handler function and reset form submission state
						if (form.$valid) {
							fn(scope, { $event : event });
							form.$submitted = false;
						}
					});
				});
			}
		};
	}
]);