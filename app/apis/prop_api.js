var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var Landlord 			= require('../models/landlord');
var Neighborhood 		= require('../models/neighborhood');
var https 				= require('https');  
var http 				= require('http'); 
var AWS = require('aws-sdk'),
    crypto = require('crypto');
var neighborhoods 		= require('./neighborhoods');
var inside = require('point-in-polygon');
 
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY; 
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

// ===================================================
// CREATE NEW PROPERTY FROM UI
exports.createProperty = function(req, res) {
	Property.create({
				name 			: req.body.name,
				price			: req.body.price,
				street		 	: req.body.street,
				city			: req.body.city,
				zip				: req.body.zip,
				street2			: req.body.suite,
				state 			: req.body.state,
				description	 	: req.body.description,
				num_beds		: req.body.numBeds,
				num_baths	   	: req.body.numBaths,
				is_rented		: false,
				landlord_id		: req.body.user
	}, function(err, property) {
		if(err) {
			console.log('error creating a prop');
			res.send(err);
		}
		var info = {
			street 	: property.street,
			city 	: property.city,
			state 	: property.state
		};
		res.json(200, property);
		findLatLong(info, property._id);
	});
};

// ===================================================
// FIND THE LAT AND LONG FOR A PROPERTY VIA GOOGLE
function findLatLong(info, prop_id) {
	console.log('finding the lat long');
	var geocode_API_key = 'AIzaSyCa5lOnYd8klc02w9Up2mETb-uPwou-adg';
	var addr = info.street.split(' ').join('+');
	var city = info.city.split(' ').join('+');
	var state = info.state.split(' ').join('+');
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
			var myNeighborhood = 'all';
			myLat = parsedJSON.results[0].geometry.location.lat || 0;
			myLong = parsedJSON.results[0].geometry.location.lng || 0;
			if(myLat != 0 && myLong != 0) {
				myNeighborhood = findNeighborhood(myLat, myLong);
			}

			Property.findOneAndUpdate({
				"_id" : prop_id,
			}, {
				latitude   		: myLat,
				longitude 		: myLong,
				neighborhood 	: myNeighborhood
			}, function(err, prop) {
				if(err) {
					console.log('got error: ' + JSON.stringify(err));
				}
			});
		});
	});

	google_req.on('error', function(e) {
  		res.send(e);
	});
	google_req.end();
}


function findNeighborhood(latitude, longitude) {
	var point = [latitude, longitude];
	var myNArr = neighborhoods.hoods;
	for (var i = 0; i < myNArr.length; i++) {
		if(inside(point, myNArr[i].coordinates)) {
			return myNArr[i].name;
		}
	}
	return 'all';
}


exports.updateProperty = function(req, res) {
	var myProp = new Property({
  		name 			: req.body.name,
		city			: req.body.city,
		street			: req.body.street,
		state			: req.body.state,
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

exports.makeImagePrimary = function(req, res) {
	var query = { _id : req.params.property_id };
	var imageArray = req.body['imageArr'];
	var firstImage = req.body['firstImageURL'];

	for(var i = 0; i < imageArray.length; i++) {
		if(imageArray[i] === firstImage) {
			var temp = imageArray[0];
			imageArray[0] = imageArray[i];
			imageArray[i] = temp;
		}
	}

	var updates = { imageURLs : imageArray };
	Property.update(query, updates, function(err, affected) {
		res.json(201, 'Updated property with first image');
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
			res.json(201, property);
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

exports.getNeighborhoods = function(req, res) {
	Neighborhood.find({}, function(err, neighborhoods) {
		if(err) res.send(err);
		res.send(neighborhoods);
	});
};


exports.getPropsByLandlord = function(req, res) {
	var landlord_id = req.params.landlord_id;

	Property.find({ 'landlord_id' : landlord_id}, function(err, properties) {
		if(err) res.send(err);
		res.send(properties);
	});
};

exports.getPropJunctionsForLandlord = function(req, res) {
	var landlord_id = req.params.landlord_id;
	var prop_id = req.params.property_id;

	PropertyJunction.find({ 'landlord_id' 	: landlord_id,
							'PropertyId' 	: prop_id,
							'swipeStatus'	: 0 
	}, function(err, junctions) {
		if(err) res.send(err);
		console.log('got junctions: ' + JSON.stringify(junctions));
		res.send(junctions);
	});
};

exports.getLandlord = function(req, res) {
	var landlord_id = req.params.landlord_id;

	Landlord.find({ '_id' : req.user._id}, function(err, landlords) {
		if(err) res.send(err);
		res.send(landlords[0]);
	});
};
