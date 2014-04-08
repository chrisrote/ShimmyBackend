// load the property model
var Property = require('./models/property');
var https = require('https');
var crypto = require('crypto');
var path = require('path');

var prop_api = require('./apis/prop_api'),
	aws = require('./apis/aws');
    //index = require('./controllers'),

// expose the routes to our app with module.exports
module.exports = function(app) {

	// GET ALL PROPERTies ====================================================
	app.get('/api/property', prop_api.getAllProperties);

	// CREATE PROPERTY ========================================================
	app.post('/api/property', prop_api.createProperties);


	// DELETE PROPERTY ========================================================
	app.delete('/api/property/:property_id', prop_api.deleteProperty);

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); 
	});

};