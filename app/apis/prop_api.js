var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var https 				= require('https');

// ===================================================
// CREATE NEW PROPERTY FROM UI
exports.createProperties = function(req, res) {
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
		console.log('STATUS: ' + google_res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(google_res.headers));
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
				address		 	: req.body.street,
				description	 	: req.body.description,
				num_beds		: req.body.numBeds,
				num_baths	   	: req.body.numBaths,
				is_rented		: false,
				imageURLs 		: ['https://s3.amazonaws.com/Shimmy/apartments/default_apt.png'],
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


// ===================================================
// Get all properties for the email address entered by
// the user. Do not return properties that already have
// a property junction created
exports.getPropertiesForUserEmail = function(req, res) {
	var filters = req.params.filters;

};

// ===================================================
// Update a property to rented
exports.propertyRentalStatusChanged = function(req, res) {
	
};

// ===================================================
// Update Property
exports.updatePropertyImages = function(req, res) {
	Property.find({'_id': req.prop_id}, function(err, property) {
		if(err) res.send(err);
		property.imageURLs = req.body.myImages;
		property.save(function(err) {
			if(err) res.send(err);
			res.send(property);
		});
	});
};

exports.getPropertyById = function(req, res) {
	Property.find({'_id': req.prop_id}, function(err, property) {
		if(err) res.send(err);
		res.send(property);
	});
};

// ===================================================
// Receive property junctions
exports.postPropJunctions = function(req, res) {
	var email = req.params.user-email;
	var phone = req.params.phone;

	// ============================================================
	// SEE HOW TO MASS INSERT RECORDS MONGODB!!!!!
	// ============================================================
};

// ===================================================
// GET ALL PROPERTIES METHOD -- Testing purposes
exports.getAllProperties = function(req, res) {
	Property.find(function(err, properties) {
		if(err) res.send(err);
		res.json(properties);
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
