// load the property model
var Property 	= require('./models/property');
var Landlord 	= require('./models/landlord');
var https 		= require('https');
var crypto 		= require('crypto');
var path 		= require('path');

var prop_api 	= require('./apis/prop_api'),
	aws_api 	= require('./apis/aws_api'),
	tenant_api	= require('./apis/tenant_api');   

// expose the routes to our app with module.exports
module.exports = function(app, passport) {

	// ========================================================================
	// TENANT METHODS
	// ========================================================================

	app.post('/api/propsForTenant', tenant_api.getPropsForTenant);
	app.post('/api/createPropJunctions', tenant_api.createPropJunctions);
	app.post('/api/createNewTenant', tenant_api.createNewTenant);

	// ========================================================================
	// LANDLORD METHODS
	// ========================================================================

	app.get('/api/landlord/:landlord_id', prop_api.getLandlord);

	// ========================================================================
	// PROPERTY METHODS
	// ========================================================================

	app.get('/api/propertyById/:property_id', isLoggedIn, prop_api.propertyById);
	app.post('/api/property', isLoggedIn, prop_api.createProperty);
	app.put('/api/updateProperty', isLoggedIn, prop_api.updateProperty);
	app.put('/api/updatePropertyImages/:property_id', isLoggedIn, prop_api.updatePropertyImageArr);
	app.put('/api/updatePropImagesWithNewArr/:property_id', isLoggedIn, prop_api.newPropertyImageArr);
	app.delete('/api/property/:property_id', isLoggedIn, prop_api.deleteProperty);

	// ========================================================================
	// AMAZON S3 POLICY 
	// ========================================================================

	app.get('/api/s3Policy', aws_api.getS3Policy);
	app.get('/api/config', aws_api.getClientConfig);

	// ========================================================================
	// AUTHENTICATION / RENDER PAGE METHODS
	// ========================================================================

	// HOME PAGE (with login links) ===========================================
	app.get('/', function(req, res) {
		if(req.isAuthenticated()) res.redirect('/profile');
		else res.render('index.ejs');
	});

	// LOGIN ==================================================================
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/settings', isLoggedIn, function(req, res){
		res.render('settings.ejs', {
			aLandlord 	: req.user._id
		});
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
		Property.find({ 'landlord_id' : req.user._id}, function(err, properties) {
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

	/*app.get('*', function(req, res){
		if(req.isAuthenticated()) res.redirect('/profile');
		else res.render('index.ejs');
	});*/

	app.get('/new_property', isLoggedIn, function(req, res) {
		res.render('new_property.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	app.get('/edit_property/:property_id', isLoggedIn, function(req, res){
		res.render('edit_property.ejs', {
			property_id : req.params.property_id
		});
	});
};



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
