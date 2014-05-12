// load mongoose since we need it to define a model
var mongoose = require('mongoose');

module.exports = mongoose.model('Property_Junction', {
	email			: String,
	phone			: String,
	message			: String,
	PropertyId		: mongoose.Schema.Types.ObjectId,
	tenant_id 		: mongoose.Schema.Types.ObjectId,
	swipeStatus		: Number			// Status for liked = 1, contact = 0, or don't contact = 2
});


