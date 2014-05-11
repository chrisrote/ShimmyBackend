'use strict';

var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var Tenant				= require('../models/tenant');

// Called when hitting route
// /api/propsForTenant
exports.getPropsForTenant = function(req, res) {
	console.log('tenant id: ' + req.body.tenant_id);
	PropertyJunction.find({ tenant_id: req.body.tenant_id }, function(err, junctions) {
	    if(err) res.send(err);
	    
	    var prop_ids = [];
	    junctions.forEach(function(junc) {
	        prop_ids.push(junc.PropertyId); 
	    });
         
	    Property.find(req.body.searchOpts).nin('_id', prop_ids).exec(function(err, properties) {
	    	if(err) res.send(err);

	    	var propJunctions = [];

	    	properties.forEach(function(entry) {
	    		var newJunc = { 
	    			"email" 		: req.body.email,
					"phone"			: req.body.phone,
					"message"		: req.body.message,
					"PropertyId"	: entry._id,
					"tenant_id"    	: req.body.tenant_id
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
				res.send(finalRes);
	    	});
	    }); 
	});

};


// Called when hitting route
// /api/createPropJunctions
exports.createPropJunctions = function(req, res) {
	var newPropJunctions = req.body.property_junctions;
	console.log('got new property_junctions: ' + JSON.stringify(newPropJunctions));
	newPropJunctions.forEach(function(entry) {
		PropertyJunction.update({ _id : entry._id }, { swipeStatus : entry.swipeStatus}, function(err, affected) {
			console.log('updated');
		});
	});
	res.send('updated ' + newPropJunctions.length + ' junctions');
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
    	roomates		: newTenant.roommates
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
