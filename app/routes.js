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
			console.log('got some properties: ' + properties);
			res.json(properties);
		});
	});

	// CREATE PROPERTY ========================================================
	app.post('/api/property', function(req, res) {
		Property.create({
			name 		: req.body.name
		}, function(err, property) {
			if(err) {
				res.send(err);
			}

			Property.find(function(err, properties) {
				if(err) res.send(err);
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