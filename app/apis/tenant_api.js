'use strict';

var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var Tenant				= require('../models/tenant');

// Called when hitting route
// /api/propsForTenant
exports.getPropsForTenant = function(req, res) {
	console.log('got a req: ' + JSON.stringify(req.body));
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
         
        console.log('search params: ' + JSON.stringify(searchParams));
	    Property.find(searchParams).nin('_id', prop_ids).exec(function(err, properties) {
	    	if(err) res.send(err);
	    	if(properties.length === 0) {
	    		console.log('didnt find props');
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
					res.send(finalRes);
		    	});
	    	}
	    }); 
	});
};

// Called when hitting route
// /api/createPropJunctions
exports.setPropertyJunctions = function(req, res) {
	var newPropJunctions = req.body.property_junctions;
	console.log('got new property_junctions: ' + JSON.stringify(newPropJunctions));
	newPropJunctions.forEach(function(entry) {
		PropertyJunction.update({ _id : entry._id }, { swipeStatus : entry.swipeStatus}, function(err, affected) {

			if(entry.swipeStatus == 0) {
				// send an email
			}
    		res.send(JSON.stringify({ updated : newPropJunctions.length }));
		});
	});
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
	console.log('deleting unused prop junctions');
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
    	res.send(res_body);
	});
};
