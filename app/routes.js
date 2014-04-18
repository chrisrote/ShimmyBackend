// load the property model
var Property = require('./models/property');
var https = require('https');
var crypto = require('crypto');
var path = require('path');

var prop_api = require('./apis/prop_api'),
	aws = require('./apis/aws');   

// expose the routes to our app with module.exports
module.exports = function(app, passport) {

	// GET ALL PROPERTIES =====================================================
	app.get('/api/property', prop_api.getAllProperties);

	// CREATE PROPERTY ========================================================
	app.post('/api/property', isLoggedIn, prop_api.createProperties);

	// DELETE PROPERTY ========================================================
	app.delete('/api/property/:property_id', isLoggedIn, prop_api.deleteProperty);

	// HOME PAGE (with login links) ===========================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	app.get('/new_property', isLoggedIn, function(req, res) {
		res.render('new_property.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});


	// ========================================================================
	// AUTHENTICATION METHODS
	// ========================================================================


	// LOGIN ==================================================================
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// SIGNUP ==============================
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// RENDER THE PROFILE PAGE IF LOGGED IN ==================
	app.get('/profile', isLoggedIn, function(req, res) {
		// get all properties by user id
		console.log('my landlord id: ' + req.user._id);
		Property.find({ 'landlord_id' : req.user._id}, function(err, properties) {
			console.log('got properties: ' + properties);
			if(err) res.send(err);
			res.render('profile.ejs', {
				user 		: req.user,
				myProps 	: properties
			});
		});
	});

	// LOGOUT ================================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
