
var editProp = angular.module('editProp', ['angularFileUpload'])
    .run(function ($rootScope, $location, $http) {

        $http.get('/api/config').success(function(config) {
            $rootScope.config = config;
        });
    });

/*
editProp.directive('imageHolder', function() {
    console.log('loading directive');
    return function() {
        console.log('returning dir');
    }
});
*/

function editPropController($scope, $http, $window, $upload, $rootScope, $route) {
	$scope.prop_id = myProp;
	$scope.my_property;
	$scope.showDetails = true;
    $scope.selected_images = [];

	$http.get('/api/propertyById/' + $scope.prop_id)
		.success(function(properties) {
			$scope.my_property = properties[0];
            $scope.isRentVals = { "cur" : $scope.my_property.is_rented, "values" : ["true", "false"]};
		})
		.error(function(err) {
			alert('We got an error: ' + err);
		});

	$scope.saveEdits = function() {
        $scope.my_property.is_rented = $scope.isRentVals.cur;
		$http.put('/api/updateProperty', $scope.my_property)
			.success(function(property) {
                $window.location.href = '/profile';
			})
			.error(function(err) {
				alert('we got an error: ' + JSON.stringify(err));
			})
	};


    $scope.select_image = function(image) {
        var image_index = $scope.selected_images.indexOf(image)
        if(image_index != -1) {
            $scope.selected_images.splice(image_index, 1);
        } else {
            $scope.selected_images.push(image);
        }
    }

    $scope.delete_selected_images = function() {
        var myArr = [];

        $scope.my_property.imageURLs.forEach(function(entry) {
            if($scope.selected_images.indexOf(entry) == -1) {
                myArr.push(entry);
            }
        });

        var myImages = {};
        myImages['imageArr'] = myArr;   
        
        $http.put('/api/updatePropImagesWithNewArr/' + $scope.prop_id, myImages)
            .success(function(data){
                $scope.my_property.imageURLs = myArr;
            })
            .error(function(data) {
                alert('There was an uploading the images. Please contact admin@shimmylandlord.com for assistance');
            })
    }

	$scope.changeShowDetails = function() {
		$scope.showDetails = true;
	};

	$scope.changeShowImages = function() {
		$scope.showDetails = false;
	};

	$scope.cancel = function() {
		$window.location.href = '/profile';	
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
                            url: 'https://' + $rootScope.config.awsConfig.bucket + '.s3.amazonaws.com/',
                            method: 'POST',
                            data: {
                                'key' : 'shimmy-assets/'+ Math.round(Math.random()*10000) + '$$' + file.name,
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

                                var myArr = [];
                                myArr.push(parsedData);
                                var myImages = {};
                                myImages['imageArr'] = myArr;   
                                $http.put('/api/updatePropertyImages/' + $scope.prop_id, myImages)
                                    .success(function(data){
                                        $scope.my_property.imageURLs.push(parsedData.location);
                                    })
                                    .error(function(data) {
                                        alert('There was an uploading the images. Please contact admin@shimmylandlord.com for assistance');
                                    })
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