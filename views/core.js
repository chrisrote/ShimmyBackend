var shimmy = angular.module('shimmy', ['angularFileUpload']);

function mainController($scope, $http, $location, $upload, $rootScope) {
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
				console.log('Error: ' + data);
			});
		} else {
			alert('Please enter all required values.');	
		}
	};


	$scope.onFileSelect = function ($files) {
        $scope.files = $files;
        $scope.upload = [];
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            file.progress = parseInt(0);
            (function (file, i) {
                $http.get('/api/s3Policy?mimeType='+ file.type).success(function(response) {
                    var s3Params = response;
                    $scope.upload[i] = $upload.upload({
                        url: 'https://shimmy.s3.amazonaws.com/',
                        method: 'POST',
                        data: {
                            'key' : 's3UploadExample/'+ Math.round(Math.random()*10000) + '$$' + file.name,
                            'acl' : 'public-read',
                            'Content-Type' : file.type,
                            'AWSAccessKeyId': s3Params.AWSAccessKeyId,
                            'success_action_status' : '201',
                            'Policy' : s3Params.s3Policy,
                            'Signature' : s3Params.s3Signature
                        },
                        file: file,
                    }).then(function(response) {
                        file.progress = parseInt(100);
                        if (response.status === 201) {
                            var data = xml2json.parser(response.data),
                            parsedData;
                            parsedData = {
                                location: data.postresponse.location,
                                bucket: data.postresponse.bucket,
                                key: data.postresponse.key,
                                etag: data.postresponse.etag
                            };
                            $scope.imageUploads.push(parsedData);
                        } else {
                            alert('Upload Failed');
                        }
                    }, null, function(evt) {
                        file.progress =  parseInt(100.0 * evt.loaded / evt.total);
                    });
                });
            }(file, i));
        }
    };
}