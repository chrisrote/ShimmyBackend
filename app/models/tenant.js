var mongoose = require('mongoose');

// define the schema for our user model
var tenantSchema = mongoose.Schema({
    email        	: String,
    phone		 	: String,
    searchOpts	 	: {},
    contactMessage	: String,
    roomates		: [mongoose.Schema.Types.ObjectId]
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Tenant', tenantSchema);
