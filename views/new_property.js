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
    var s3_asset_folder = 'shimmy-assets/'; 

    $scope.bed_options = [
        { name: '0', value: '0' }, 
        { name: '1', value: '1' }, 
        { name: '2', value: '2' },
        { name: '3', value: '3' }, 
        { name: '4', value: '4' },
        { name: '5', value: '5' }
    ];

    $scope.bath_options = [
        { name: '1', value: '1' }, 
        { name: '2', value: '2' },
        { name: '3', value: '3' }, 
        { name: '4', value: '4' },
        { name: '5', value: '5' }
    ];

    $scope.state_options = [
    { name: 'ALABAMA', abbreviation: 'AL'},
    { name: 'ALASKA', abbreviation: 'AK'},
    { name: 'ARIZONA', abbreviation: 'AZ'},
    { name: 'ARKANSAS', abbreviation: 'AR'},
    { name: 'CALIFORNIA', abbreviation: 'CA'},
    { name: 'COLORADO', abbreviation: 'CO'},
    { name: 'CONNECTICUT', abbreviation: 'CT'},
    { name: 'DELAWARE', abbreviation: 'DE'},
    { name: 'FLORIDA', abbreviation: 'FL'},
    { name: 'GEORGIA', abbreviation: 'GA'},
    { name: 'HAWAII', abbreviation: 'HI'},
    { name: 'IDAHO', abbreviation: 'ID'},
    { name: 'ILLINOIS', abbreviation: 'IL'},
    { name: 'INDIANA', abbreviation: 'IN'},
    { name: 'IOWA', abbreviation: 'IA'},
    { name: 'KANSAS', abbreviation: 'KS'},
    { name: 'KENTUCKY', abbreviation: 'KY'},
    { name: 'LOUISIANA', abbreviation: 'LA'},
    { name: 'MAINE', abbreviation: 'ME'},
    { name: 'MARYLAND', abbreviation: 'MD'},
    { name: 'MASSACHUSETTS', abbreviation: 'MA'},
    { name: 'MICHIGAN', abbreviation: 'MI'},
    { name: 'MINNESOTA', abbreviation: 'MN'},
    { name: 'MISSISSIPPI', abbreviation: 'MS'},
    { name: 'MISSOURI', abbreviation: 'MO'},
    { name: 'MONTANA', abbreviation: 'MT'},
    { name: 'NEBRASKA', abbreviation: 'NE'},
    { name: 'NEVADA', abbreviation: 'NV'},
    { name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
    { name: 'NEW JERSEY', abbreviation: 'NJ'},
    { name: 'NEW MEXICO', abbreviation: 'NM'},
    { name: 'NEW YORK', abbreviation: 'NY'},
    { name: 'NORTH CAROLINA', abbreviation: 'NC'},
    { name: 'NORTH DAKOTA', abbreviation: 'ND'},
    { name: 'OHIO', abbreviation: 'OH'},
    { name: 'OKLAHOMA', abbreviation: 'OK'},
    { name: 'OREGON', abbreviation: 'OR'},
    { name: 'PENNSYLVANIA', abbreviation: 'PA'},
    { name: 'RHODE ISLAND', abbreviation: 'RI'},
    { name: 'SOUTH CAROLINA', abbreviation: 'SC'},
    { name: 'SOUTH DAKOTA', abbreviation: 'SD'},
    { name: 'TENNESSEE', abbreviation: 'TN'},
    { name: 'TEXAS', abbreviation: 'TX'},
    { name: 'UTAH', abbreviation: 'UT'},
    { name: 'VERMONT', abbreviation: 'VT'},
    { name: 'VIRGINIA', abbreviation: 'VA'},
    { name: 'WASHINGTON', abbreviation: 'WA'},
    { name: 'WEST VIRGINIA', abbreviation: 'WV'},
    { name: 'WISCONSIN', abbreviation: 'WI'},
    { name: 'WYOMING', abbreviation: 'WY' }
    ];

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
        $scope.comp_images.push(img);

        $http.get('/api/s3Policy?mimeType='+ img_type).success(function(response) {
            var s3Params = response;
            $scope.upload[i] = $upload.upload({
                url: 'https://' + $rootScope.config.awsConfig.bucket + '.s3.amazonaws.com/',
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
}

