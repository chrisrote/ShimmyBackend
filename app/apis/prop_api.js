var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var https 				= require('https');

// ===================================================
// CREATE NEW PROPERTY FROM UI
exports.createProperties = function(req, res) {
	// Callout to Google Geocoding API
	var geocode_API_key = 'AIzaSyCa5lOnYd8klc02w9Up2mETb-uPwou-adg';
	var addr = req.body.address.split(' ').join('+');
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

			console.log('my user: ' + req.body.user);
			Property.create({
				name 			: req.body.name,
				price			: req.body.price,
				address		 	: req.body.address,
				description	 	: req.body.description,
				num_beds		: req.body.numBeds,
				num_baths	   	: req.body.numBaths,
				imageURLs 		: ['https://s3.amazonaws.com/Shimmy/apartments/default_apt.png'],
				latitude	    : latitude,
				longitude	 	: longitude,
				landlord_id		: req.body.user
			}, function(err, property) {
				if(err) res.send(err);

				Property.find(function(err, properties) {
					if(err) res.send(err);
					console.log('A TOTAL OF ' + properties.length + ' properties');
					res.json(properties);
				});
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
	
}

// ===================================================
// Update Property
exports.updateProperty = function(req, res) {

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
// DELETE METHOD
exports.deleteProperty = function(req, res) {
	Property.remove({
		_id : req.params.property_id
	}, function(err, property) {
		if(err) res.send(err);

		Property.find(function(err, properties) {
			if(err) res.send(err);
			res.json(properties);
		});
	});
};
