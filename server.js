var express   		= require('express');
var app     		= express();
var mongoose  		= require('mongoose');
var passport 		= require('passport');
var flash 	 		= require('connect-flash');

// configuration ===============================================================
var url = process.env.MONGOLAB_URI ||
	'mongodb://th:Shimmy@ds053638.mongolab.com:53638/shimmy';
var port = Number(process.env.PORT || 5000);

mongoose.connect(url);
require('./config/passport')(passport); // pass passport for configuration

app.configure(function() { 

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

  	app.set('view engine', 'ejs');

	// required for passport
	app.use(express.session({ secret: 'thisisshimmy' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash());

	app.use(express.favicon(__dirname + '../img/favicon.ico')); 

  	app.use(express.static(__dirname + '/views'));     	// set the static files location /public/img will be /img for users
  	app.use(express.methodOverride());                  // simulate DELETE and PUT
});

app.configure('development', function()
{  	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  	app.use(express.errorHandler());
});

// define routes ==============================================================
require('./app/routes')(app, passport);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
