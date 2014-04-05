// load the property model
var Property = require('./models/property');
var https = require('https');

// expose the routes to our app with module.exports
module.exports = function(app) {

	// GET ALL PROPERTies ====================================================
	app.get('/api/property', function(req, res) {

		Property.find(function(err, properties) {
			if(err) {
				console.log('ERROR IN GETTING PROPERTIES: ' + err);
				res.send(err);
			}
			console.log('got some properties: ' + properties.length);
			res.json(properties);
		});
	});

	// CREATE PROPERTY ========================================================
	app.post('/api/property', function(req, res) {
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

				Property.create({
					name 		: req.body.name,
					address		: req.body.address,
					description	: req.body.description,
					num_beds	: req.body.numBeds,
					num_baths	: req.body.numBaths,
					latitude	: latitude,
					longitude	: longitude
				}, function(err, property) {
					if(err) {
						console.log('error creating property')
						res.send(err);
					}

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
	});


	// DELETE PROPERTY ========================================================
	app.delete('/api/property/:property_id', function(req, res) {
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

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); 
	});

};