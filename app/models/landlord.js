var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var landlordSchema = mongoose.Schema({

    local            : {
    	fname		 : String,
    	lname		 : String,
        email        : String,
        password     : String,
        phone		 : String,
        city		 : String
    }

});

// methods ======================
// generating a hash
landlordSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
landlordSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Landlord', landlordSchema);
