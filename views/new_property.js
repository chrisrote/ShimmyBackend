'use strict'

var shimmy 		= angular.module('shimmy', ['rcWizard', 'rcForm', 'rcDisabledBootstrap', 'angularFileUpload'])
  .run(function ($rootScope, $location, $http) {

    $http.get('/api/config').success(function(config) {
        $rootScope.config = config;
      });
  });

function mainController($scope, $http, $location, $window, $q, $timeout, $upload, $rootScope) {
	$scope.new_property = {};
	$scope.userId = window.myUser;
	$scope.propertyId;
	$scope.imageUploads = [];
    
    $scope.abort = function(index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
    };

	// when submitting the add form, send the text to the node API
	$scope.createProperty = function() {
		$scope.new_property['user'] = $scope.userId;
		$http.post('/api/property', $scope.new_property)
			.success(function(data){
				$scope.propertyId = data['_id'];
			})
			.error(function(data){
				console.log('Error: ' + data);
			});
	};

	$scope.saveState = function() {
	    var deferred = $q.defer();
	    
	    $timeout(function() {
	      deferred.resolve();
	    }, 2000);
	    
	    return deferred.promise;
  	};


  	$scope.completeProperty = function() {
      var myImages = {};
      myImages['imageArr'] = $scope.imageUploads;  		
      $http.put('/api/updatePropertyImages/' + $scope.propertyId, myImages)
  			.success(function(data){
  				$window.location.href = '/profile';
  			})
  			.error(function(data) {
  				alert('There was an error. Please contact admin@shimmylandlord.com for assistance');
  			})
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

