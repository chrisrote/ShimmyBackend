var shimmy = angular.module('shimmy', []);

/*
shimmy.config(function ($routeProvider) {
  $routeProvider
    .when('/submitted',
    {
      redirectTo : '/'
    }
  )
});*/


function mainController($scope, $http, $location, $window) {
	$scope.formData = {};
	$scope.userId = window.myUser;

	// when submitting the add form, send the text to the node API
	$scope.createProperty = function() {
		console.log('scope userid: ' + $scope.userId);

		$scope.formData['user'] = $scope.userId;
		console.log('my form data: ' + JSON.stringify($scope.formData));
		$http.post('/api/property', $scope.formData)
			.success(function(data){
				$window.location.href = '/profile';
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