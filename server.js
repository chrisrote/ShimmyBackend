
// set up ======================================================================
var express   = require('express');
var app     = express();
var mongoose  = require('mongoose');

// configuration ===============================================================
var url = process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        'mongodb://localhost/27017/test';
var port = Number(process.env.PORT || 5000);

mongoose.connect(url); 

app.configure(function() {
  app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users
  app.use(express.logger('dev'));                     // log every request to the console
  app.use(express.bodyParser());                      // pull information from html in POST
  app.use(express.methodOverride());                  // simulate DELETE and PUT
});

// define routes ==============================================================
require('./app/routes')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);





