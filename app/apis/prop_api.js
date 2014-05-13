var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var Landlord 			= require('../models/landlord');
var https 				= require('https');
var http 				= require('http');
var AWS = require('aws-sdk'),
    crypto = require('crypto');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

// ===================================================
// CREATE NEW PROPERTY FROM UI
exports.createProperty = function(req, res) {
	// Callout to Google Geocoding API
	var geocode_API_key = 'AIzaSyCa5lOnYd8klc02w9Up2mETb-uPwou-adg';
	var addr = req.body.street.split(' ').join('+');
	var city = req.body.city.split(' ').join('+');
	var state = req.body.state.split(' ').join('+');
	var full_addr = addr + ',+' + city + ',+' + state;
	var my_result = '';
	var geocode_path = '/maps/api/geocode/json?address=' + full_addr + '&sensor=false&key=' + geocode_API_key;
	var latitude, longitude;

	var options = {
  		hostname: 'maps.googleapis.com',
  		port: 443,
  		path: geocode_path,
  		method: 'GET'
	};

	var google_req = https.request(options, function(google_res) {
		google_res.setEncoding('UTF8');
		google_res.on('data', function(chunk) {
			my_result += chunk;
		});

		google_res.on('end', function() {
			var parsedJSON = JSON.parse(my_result);
			latitude = parsedJSON.results[0].geometry.location.lat;
			longitude = parsedJSON.results[0].geometry.location.lng;
			Property.create({
				name 			: req.body.name,
				price			: req.body.price,
				street		 	: req.body.street,
				city			: req.body.city,
				zip				: req.body.zip,
				state 			: req.body.state,
				description	 	: req.body.description,
				num_beds		: req.body.numBeds,
				num_baths	   	: req.body.numBaths,
				is_rented		: false,
				latitude	    : latitude,
				longitude	 	: longitude,
				landlord_id		: req.body.user
			}, function(err, property) {
				if(err) res.send(err);

				res.send(property);
			});
		});
	});

	google_req.on('error', function(e) {
  		res.send(e);
	});
	google_req.end();
};

getExpiryTime = function () {
    var _date = new Date();
    return '' + (_date.getFullYear()) + '-' + (_date.getMonth() + 1) + '-' +
        (_date.getDate() + 1) + 'T' + (_date.getHours() + 3) + ':' + '00:00.000Z';
};

createS3Policy = function(contentType, callback) {
    var date = new Date();
    var s3Policy = {
        'expiration': getExpiryTime(),
        'conditions': [
            ['starts-with', '$key', 'shimmy-assets/'],
            {'bucket': S3_BUCKET},
            {'acl': 'public-read'},
            ['starts-with', '$Content-Type', contentType],
            {'success_action_status' : '201'}
        ]
    };
    var stringPolicy = JSON.stringify(s3Policy);
    var base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');
    var signature = crypto.createHmac('sha1', AWS_SECRET_KEY)
                        .update(new Buffer(base64Policy, 'utf-8')).digest('base64');

    var s3Credentials = {
        s3Policy: base64Policy,
        s3Signature: signature,
        AWSAccessKeyId: AWS_ACCESS_KEY
    };
    callback(s3Credentials);
};

exports.uploadImage = function(req, res) {
	var prop_id = req.params.property_id;
	console.log('got a file: ' + JSON.stringify(req.files));
	console.log('got a type: ' + JSON.stringify(req.files.file.type));

	createS3Policy(req.files.file.type , function (creds, err) {
		console.log('got creds: ' + JSON.stringify(creds));
		var options = {
  			port: 443,
  			path: req.file.path,
	  		url: 'https://shimmy-assets-tyler.s3.amazonaws.com/',
            method: 'POST',
            data: {
               'key' : 'shimmy-assets/' + Math.round(Math.random()*10000) + '$$' + req.files.file.name,
               'acl' : 'public-read',
               'Content-Type' : req.files.file.type,
                'AWSAccessKeyId': creds.AWSAccessKeyId,
                'success_action_status' : '201',
                'Policy' : creds.s3Policy,
                'Signature' : creds.s3Signature
            },
            file: req.files.file,
		};

		var amazon_req = https.request(options, function(amazon_res) {
			amazon_res.setEncoding('UTF8');
			console.log('uploading');
			// console.log('amazon res: ' + JSON.stringify(amazon_res));
		});

		/*amazon_req.on('error', function(e) {
	  		res.send(e);
		});*/
		amazon_req.end();
	});
};

exports.updateProperty = function(req, res) {
	var myProp = new Property({
  		name 			: req.body.name,
		city			: req.body.city,
		street			: req.body.street,
		zip				: req.body.zip,
		description		: req.body.description,
		num_beds		: req.body.num_beds,
		num_baths		: req.body.num_baths,
		price			: req.body.price,
		imageURLs		: req.body.imageURLs,
		is_rented		: req.body.is_rented,
		availableDate	: req.body.availableDate
	});

	var upsertData = myProp.toObject();
	delete upsertData._id;

	Property.findOneAndUpdate({ _id : req.body._id }, {$set : upsertData}, function(err, property) {
		if(err) res.send('Got an Error: ' + err);
		res.send(property);
	});
};


exports.newPropertyImageArr = function(req, res) {
	var query = { _id : req.params.property_id };
	var imageArray = req.body['imageArr'];
	var updates = { imageURLs : imageArray };
	Property.update(query, updates, function(err, affected) {
		res.send('success');
	});
};

// ===================================================
// Update Property Images
exports.updatePropertyImageArr = function(req, res) {
	var query = { _id : req.params.property_id };
	var myImages = [];
	var imageArray = req.body['imageArr'];

	Property.find({'_id': req.params.property_id }, function(err, property) {
		if(err) res.send(err);
		imageArray.forEach(function(entry) {
			myImages.push(entry['location']);
		});

		property[0].imageURLs.forEach(function(entry) {
			myImages.push(entry);
		});
		
		var updates = { imageURLs : myImages };
		Property.update(query, updates, function(err, affected) {
			res.send('success');
		});
	});
};

exports.propertyById = function(req, res) {
	Property.find({'_id': req.params.property_id }, function(err, property) {
		if(err) res.send(err);
		res.send(property);
	});
};

// ===================================================
// DELETE ALL PROPERTIES AND PROPERTY JUNCTIONS
exports.deleteProperty = function(req, res) {
	PropertyJunction.remove({
		PropertyId : req.params.property_id
	}, function(err, property) {
		Property.remove({
			_id : req.params.property_id
		}, function(err, property) {
			if(err) res.send(err);

			Property.find(function(err, properties) {
				if(err) res.send(err);
				res.json(properties);
			});
		});
	});
};


exports.getLandlord = function(req, res) {
	var landlord_id = req.params.landlord_id;

	Landlord.find({ '_id' : req.user._id}, function(err, landlords) {
		if(err) res.send(err);
		res.send(landlords[0]);
	});
};
