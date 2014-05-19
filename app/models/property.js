// load mongoose since we need it to define a model
var mongoose = require('mongoose');

module.exports = mongoose.model('Property', {
	name 			: String,
	city			: String,
	street			: String,
	zip				: String,
	state			: String,
	street2			: String,
	description		: String,
	num_beds		: Number,
	num_baths		: Number,
	price			: Number,
	latitude		: String,
	longitude		: String,
	number_of_units	: Number,
	neighborhood	: String,
	imageURLs		: [String],
	is_rented		: Boolean,
	landlord_id		: mongoose.Schema.Types.ObjectId,
	availableDate	: Date
});
