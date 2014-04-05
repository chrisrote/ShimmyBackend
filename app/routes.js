// load the property model
var Property = require('./models/property');

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
		console.log('request body: ' + req.body);
		Property.create({
			name 		: req.body.name,
			address		: req.body.address,
			description	: req.body.description,
			num_beds	: req.body.numBeds,
			num_baths	: req.body.numBaths
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