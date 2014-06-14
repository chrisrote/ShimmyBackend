'use strict'

angular.module('shimmy.controllers')
.controller('newPropertyController', ['$scope', '$http', '$location', '$window', '$q', '$timeout', '$upload', 
function($scope, $http, $location, $window, $q, $timeout, $upload){
	$scope.new_property = {};
	$scope.userId = window.myUser;
	$scope.propertyId;
	$scope.imageUploads = [];
    var s3_asset_folder = 'shimmy-assets/'; 

    $http.get('/api/config').success(function(config) {
        $scope.my_config = config;
    });

    $scope.bed_options   = bed_opts;
    $scope.bath_options  = bath_opts;
    $scope.state_options = state_opts;

    $scope.state_form = {type : $scope.state_options[12].abbreviation};
    $scope.bed_form = {type : $scope.bed_options[0].value};
    $scope.bath_form = {type : $scope.bath_options[0].value};


    $scope.abort = function(index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
    };

	// when submitting the add form, send the text to the node API
	$scope.createProperty = function() {
    $scope.new_property.numBaths = $scope.bath_form.type;
    $scope.new_property.numBeds = $scope.bed_form.type;
    $scope.new_property.state = $scope.state_form.type;
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
	    }, 1500);
	    
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

    function getBlobFromURL(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }


    function sendToS3(data, i, img_name, img_type) {
        var img = getBlobFromURL(data)
        img.progress = parseInt(0);
        img.name = img_name;
        $scope.comp_images.push(img);

        $http.get('/api/s3Policy?mimeType='+ img_type).success(function(response) {
            var s3Params = response;
            $scope.upload[i] = $upload.upload({
                url: 'https://' + $scope.my_config.awsConfig.bucket + '.s3.amazonaws.com/',
                method: 'POST',
                data: {
                    'key' : s3_asset_folder + Math.round(Math.random()*10000) + '$$' + img_name,
                    'acl' : 'public-read',
                    'Content-Type' : img_type,
                    'AWSAccessKeyId': s3Params.AWSAccessKeyId,
                    'success_action_status' : '201',
                    'Policy' : s3Params.s3Policy,
                    'Signature' : s3Params.s3Signature
                },
                file: img,
            }).then(function(response) {
                console.log('got response');
                img.progress = parseInt(100);
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
                img.progress =  parseInt(100.0 * evt.loaded / evt.total);
            });
        });
    }
    
	$scope.onFileSelect = function ($files) {
            $scope.files = $files;
            $scope.upload = [];
            $scope.comp_images = [];
            for (var i = 0; i < $files.length; i++) {
                var fr = new FileReader();
                var myName = $files[i].name;
                var myType = $files[i].type;
                fr.onload = function (e) {
                    var img = new Image();
                    var fileSent = false;
                    img.onload = function(){
                        var MAXWidthHeight = 488;
                        var ratio = MAXWidthHeight / Math.max(this.width,this.height);
                        var w = Math.round(this.width * ratio);
                        var h = Math.round(this.height * ratio);
                        var c = document.createElement("canvas");
                        c.width = w;
                        c.height = h;
                        c.getContext("2d").drawImage(this,0,0,w,h);
                        this.src = c.toDataURL();
                        if(!fileSent) {
                            sendToS3(c.toDataURL(), i, myName, myType);
                            fileSent = true;
                        }
                        document.body.appendChild(this);
                    }
                    img.src = e.target.result;
                } 
                fr.readAsDataURL($files[i]);
            }
        };
}]);

