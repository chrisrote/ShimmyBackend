// load mongoose since we need it to define a model
var mongoose = require('mongoose');

module.exports = mongoose.model('Property', {
	name 			: String,
	address			: String,
	description		: String,
	num_beds		: Number,
	num_baths		: Number,
	price			: Number, 
	latitude		: String,
	longitude		: String,
	neighborhood	: String,
	imageURLs		: [String],
	availableDate	: Date
});
