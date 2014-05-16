
var editProp = angular.module('editProp', ['angularFileUpload'])
    .run(function ($rootScope, $location, $http) {

        $http.get('/api/config').success(function(config) {
            $rootScope.config = config;
        });
    });

function editPropController($scope, $location, $http, $window, $timeout, $upload, $rootScope, $route) {
	$scope.prop_id = myProp;
	$scope.my_property;
	$scope.showDetails = true;
    $scope.selected_images = [];
    $scope.isRentVals = {};

    $scope.tf_options = [
        { name: 'False', value: 'false' }, 
        { name: 'True', value: 'true' }
    ]; 

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

    $scope.tf_form = {type : $scope.tf_options[0].value};
    $scope.bed_form = {type : $scope.bed_options[0].value};
    $scope.bath_form = {type : $scope.bath_options[0].value};
    $scope.state_form = {type : $scope.state_options[0].abbreviation};

	$http.get('/api/propertyById/' + $scope.prop_id)
		.success(function(properties) {
			$scope.my_property = properties[0];
            if($scope.my_property.is_rented) {
                $scope.tf_form = {type : $scope.tf_options[1].value};
            }

            var myIndex = 0;
            console.log('state: ' + $scope.my_property.state);
            for(var i = 0; i < $scope.state_options.length; i++) {
                if($scope.state_options[i].abbreviation == $scope.my_property.state) {
                    console.log('found: ' + i);
                    myIndex = i;
                }
            }
            $scope.bath_form    = {type : $scope.bath_options[$scope.my_property.num_baths - 1].value};
            $scope.bed_form     = {type : $scope.bed_options[$scope.my_property.num_beds].value};
            $scope.state_form   = {type : $scope.state_options[myIndex].abbreviation};
		})
		.error(function(err) {
			alert('We got an error: ' + err);
		});

	$scope.saveEdits = function() {
        $scope.my_property.is_rented = $scope.tf_form.type;
        $scope.my_property.num_beds = $scope.bed_form.type;
        $scope.my_property.num_baths = $scope.bath_form.type;
        $scope.my_property.state = $scope.state_form.type;
        console.log('updating property: ' + JSON.stringify($scope.my_property));

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


    var compress = function(source_img_obj, quality, output_format){
             
        var mime_type = "image/jpeg";
        if(output_format != undefined && output_format == "png"){
            mime_type = "image/png";
        }
        var cvs = document.createElement('canvas');
        //console.log('cvs: ' + JSON.stringify(cvs));
        //console.log('source width: ' + source_img_obj.naturalWidth);
        //console.log('source height: ' + source_img_obj.naturalHeight);
        var ratio = 250 / source_img_obj.naturalHeight;
        cvs.width = ratio * source_img_obj.naturalWidth;
        cvs.height = 250;
        var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0);
        var newImageData = cvs.toDataURL(mime_type, ratio/100);
        var result_image_obj = new Image();
        result_image_obj.src = newImageData;
        return result_image_obj;
    };

    $scope.onFileSelect = function($files) {
        $scope.files = $files;
            $scope.upload = [];
            for (var i = 0; i < $files.length; i++) {
                console.log('file: ' + JSON.stringify($files[i]));
                var file = $files[i];
                file.progress = parseInt(0);
                (function (file, i) {
                    $http.get('/api/s3Policy?mimeType='+ file.type).success(function(response) {
                        var s3Params = response;
                        $scope.upload[i] = $upload.upload({
                            url: 'https://shimmy-assets-tyler.s3.amazonaws.com/',
                            method: 'POST',
                            data: {
                                'key' : 'shimmy-assets/' + Math.round(Math.random()*10000) + '$$' + file.name,
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