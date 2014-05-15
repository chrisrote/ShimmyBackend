var Property 	= require('./models/property');
var Landlord 	= require('./models/landlord');
var https 		= require('https');
var crypto 		= require('crypto');
var path 		= require('path');

var prop_api 	= require('./apis/prop_api'),
	aws_api 	= require('./apis/aws_api'),
	tenant_api	= require('./apis/tenant_api');   

module.exports = function(app, passport) {

	// ========================================================================
	// TENANT METHODS
	// ========================================================================

	app.post('/api/propsForTenant', tenant_api.getPropsForTenant);
	app.post('/api/createPropJunctions', tenant_api.createPropJunctions);
	app.post('/api/createNewTenant', tenant_api.createNewTenant);
	app.put('/api/editTenant', tenant_api.editTenant);
	app.get('/api/allProps', tenant_api.getAllProps);

	// ========================================================================
	// LANDLORD METHODS
	// ========================================================================

	app.get('/api/landlord/:landlord_id', prop_api.getLandlord);
	app.get('/api/getPropJunctionsForLandlord/:landlord_id/:property_id', prop_api.getPropJunctionsForLandlord);

	// ========================================================================
	// PROPERTY METHODS
	// ========================================================================

	app.get('/api/propertyById/:property_id', prop_api.propertyById);
	app.get('/api/getPropsByLandlord/:landlord_id', prop_api.getPropsByLandlord);
	app.post('/api/property', isLoggedIn, prop_api.createProperty);
	app.put('/api/updateProperty', isLoggedIn, prop_api.updateProperty);
	app.put('/api/updatePropertyImages/:property_id', isLoggedIn, prop_api.updatePropertyImageArr);
	app.put('/api/updatePropImagesWithNewArr/:property_id', isLoggedIn, prop_api.newPropertyImageArr);
	app.delete('/api/property/:property_id', isLoggedIn, prop_api.deleteProperty);
	app.get('/api/neighborhoods', prop_api.getNeighborhoods);


	// ========================================================================
	// AMAZON S3 POLICY 
	// ========================================================================

	app.get('/api/s3Policy', aws_api.getS3Policy);
	app.get('/api/config', aws_api.getClientConfig);

	// ========================================================================
	// AUTHENTICATION / RENDER PAGE METHODS
	// ========================================================================

	app.get('/', function(req, res) {
		if(req.isAuthenticated()) res.redirect('/profile');
		else res.render('index.ejs');
	});

	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/settings', isLoggedIn, function(req, res){
		res.render('settings.ejs', {
			aLandlord 	: req.user._id
		});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', 
		failureRedirect : '/login', 
		failureFlash : true 
	}));

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', 
		failureRedirect : '/signup', 
		failureFlash : true 
	}));

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user 		: req.user._id
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

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
	if (req.isAuthenticated()) return next();
	res.redirect('/');
}
