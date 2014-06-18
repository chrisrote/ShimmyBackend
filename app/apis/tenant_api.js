'use strict';

var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var Tenant				= require('../models/tenant');
var Landlord			= require('../models/landlord');
var nodemailer			= require("nodemailer");


// Called when hitting route
// /api/propsForTenant
exports.getPropsForTenant = function(req, res) {
	PropertyJunction.find({ tenant_id: req.body.tenant_id }, function(err, junctions) {
	    if(err) res.send(err);

	    var theOpts = req.body.searchOpts;
	    
	    var searchParams = {
	    	price : { $gte: Number(theOpts.priceLow), $lte: Number(theOpts.priceHigh) },
	    	num_beds : { $gte: Number(theOpts.bedsMin), $lte: Number(theOpts.bedsMax) },
	    	num_baths : { $gte: Number(theOpts.bathsMin), $lte: Number(theOpts.bathsMax) }
	    };
	    var prop_ids = [];
	    junctions.forEach(function(junc) {
	        prop_ids.push(junc.PropertyId); 
	    });
         
	    Property.find(searchParams).nin('_id', prop_ids).exec(function(err, properties) {
	    	if(err) res.send(err);
	    	if(properties.length === 0) {
	    		res.setHeader('Content-Type', 'application/json');
    			res.send(JSON.stringify({ 'properties' : 'none' }, null, 3));
	    	} else {
		    	var propJunctions = [];

		    	// set the swipe status to -1 to indicate
		    	// user has not yet responded
		    	properties.forEach(function(entry) {
		    		var newJunc = { 
		    			"email" 		: req.body.email,
						"phone"			: req.body.phone,
						"message"		: req.body.message,
						"PropertyId"	: entry._id,
						"tenant_id"    	: req.body.tenant_id,
						"LandlordId"	: entry.landlord_id,
						"swipeStatus"	: -1
					};
					propJunctions.push(newJunc);
		    	});

		    	PropertyJunction.create(propJunctions, function(err) {
		    		if(err) res.send(err);
		    		var insertedJunctions = [];
					for (var i = 1; i < arguments.length; ++i) {
					    insertedJunctions.push(arguments[i]);
					}
		    		var finalRes = {
						"properties" : properties,
						"junctions"	 : insertedJunctions
					};
					res.json(200, finalRes);
		    	});
	    	}
	    }); 
	});
};

function sendEmailToLandlord(aJunc) {
	Landlord.findOne({ _id : aJunc.LandlordId }, function (err, aLandlord) {
		if(err) console.log('got an error finding the landlord: ' + err);
		var smtpTransport = nodemailer.createTransport("SMTP",{
			service: "Gmail",
			auth: {
			    user: "tyler@shimmy-properties.com",
			    pass: "Ranlou1989"
			}
		});
		if(!aLandlord) {
			var mailOptions = {
			    from: "Get Shimmy! <tyler@shimmy-properties.com>", 
			    to: "tyler@shimmy-properties.com", 
			    subject: "ERROR!", 
			    text: "There was an error in associating a junction. id: " + aJunc._id,
			    html: "There was an error in associating a junction. id: " + aJunc._id
			}
		} else {
			var mailOptions = {
			    from: "Get Shimmy! <tyler@shimmy-properties.com>", 
			    to: aLandlord.local.email, 
			    subject: "Shimmy-Properties: You have a new lead!", 
			    text: "You have a new lead! Please login http://www.shimmy-properties.com/ to view. id: " + aJunc._id,
			    html: '<b>You have a new lead!</b><p>Please login <a href=\"http://www.shimmy-properties.com/\">here</a> to view.</p><p>Thanks,<br/> The Shimmy Team</p> id: ' + aJunc._id
			}
		}
		smtpTransport.sendMail(mailOptions, function(error, response){
		   if(error){
		        console.log(error);
		    }else{
		        console.log("Message sent: " + response.message);
			}
			smtpTransport.close();
		})
	});
}

function sendPushNotificationToRoommates(aJunc) {
	console.log('sending push notification');
	Tenant.findById(aJunc.tenant_id, function (err, aTenant) {
	 	console.log('a tenant: ' + JSON.stringify(aTenant));
	 	if(aTenant.roommates.length > 0) {
	 		Tenant.find({ 'fb_id': { $in : aTenant.roommates }}, function(err, roommates) {
	 			console.log('found roommates: ' + JSON.stringify(roommates));
	 			roommates.forEach(function(entry) {
	 				console.log('sending a push to entry: ' + JSON.stringify(entry));
	 			});
	 		});
	 	}	
	});
}


// Called when hitting route
// /api/createPropJunctions
exports.setPropertyJunctions = function(req, res) {
	var newPropJunctions = req.body.property_junctions;
	console.log('got prop junctions: ' + JSON.stringify(newPropJunctions));
	for (var i = 0; i < newPropJunctions.length; i++) { 
		var curJunction = newPropJunctions[i];
		if(newPropJunctions[i].hasOwnProperty('PropertyId')) {
			PropertyJunction.findOneAndUpdate({ _id : newPropJunctions[i]._id }, { swipeStatus : newPropJunctions[i].swipeStatus}, function(err, aJunc) {
				if(aJunc.swipeStatus == 0) {
					sendEmailToLandlord(aJunc);
				}
				if(aJunc.swipeStatus == 0 || aJunc.swipeStatus == 1) {
					console.log('got a swipe status of 0 or 1, sending notification to server');
					sendPushNotificationToRoommates(aJunc);
				}
			});
		}
	}
	res.json(200, { updated : newPropJunctions.length });
};

// Called when hitting route
// /api/createNewTenant
exports.createNewTenant = function(req, res) {
	var newTenant = req.body;
	Tenant.create({
		email			: newTenant.email,
		phone  			: newTenant.phone,
		searchOpts 		: newTenant.searchOpts,
		contactMessage	: newTenant.message,
    	roomates		: newTenant.roommates,
    	fb_id			: newTenant.fb_id,
    	fb_token		: newTenant.fb_token
	}, function(err, aTenant){
		if(err) res.send('failed to create tenant');
		res.send(aTenant);
	})
};

// api/editTenant
exports.editTenant = function(req, res) {
	var tenant = req.body;
	Tenant.update({ _id : req.body.tenant_id }, {
		email        	: tenant.email,
	    phone		 	: tenant.phone,
	    searchOpts	 	: tenant.searchOpts,
	    contactMessage	: tenant.message,
	    roomates		: tenant.roommates
	}, function(err, affected) {
		console.log('number of tenants updated: ' + affected);
	});
};


exports.getAllProps = function(req, res) {	    
	var searchParams = {
	   	price : { $gte: 200, $lte:1500 },
	   	num_beds : { $gte: 3, $lte: 10 },
	  	num_baths : { $gte: 0, $lte: 10 }
	};

	Property.find(searchParams, function(err, properties) {
		if(err) res.send(err);
		res.send(properties);
	});
};

exports.resetPropertyJunctions = function(req, res) {
	PropertyJunction.find({ tenant_id : req.params.tenant_id }).remove( function(err, junction) {
		if(err) {
			res.send(JSON.stringify({ 'error' : err }, null, 3));
		}
    	res.send(JSON.stringify({ 'deleteNumber' : junction.length }, null, 3));
	});
};

exports.deleteUnusedJunctionsForTenant = function(req, res) {
	PropertyJunction.find({ 
		tenant_id 	: req.params.tenant_id,
		swipeStatus : -1
	}).remove( function(err, junction) {
		if(err) {
			res.send(JSON.stringify({ 'error' : err }, null, 3));
		}
		var res_body = {
    		deleted : junction,	
    	};
    	res.json(200, res_body);
	});
};


exports.changeTenantRoommates = function(req, res) {
	Tenant.findByIdAndUpdate(req.params.tenant_id, {roommates : req.body.fb_ids}, function(err, aTenant) {
		if(err) {
			res.send(422, err);
		}
		if(!aTenant) res.json(404, 'not found');
		res.json(200, aTenant);
	});
};

exports.syncPropertiesForTenant = function(req, res) {
	PropertyJunction.find({ 'tenant_id' : req.params.tenant_id, $or:[ {'swipeStatus':0}, {'swipeStatus':1}]}, function(err, junctions) {
		if(err) res.send(422, err); 

		var propIds = [];
		for(var i = 0; i < junctions.length; i++) {
			propIds.push(junctions[i].PropertyId);
		}

		Property.find({ '_id' : { $in : propIds }}, function(err, props) {
			if(err) res.send(422, err);
			var unrented_props = [];
			for(var j = 0; j < props.length; j++) {
				if(!props[j].is_rented) {
					unrented_props.push(props[j]);
				}
			}
			res.json(201, unrented_props);
		});
	});
};



