'use strict';

var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var Tenant				= require('../models/tenant');

// Called when hitting route
// /api/propsForTenant
exports.getPropsForTenant = function(req, res) {
	PropertyJunction.find({ tenant_id: req.body.tenant_id }, function(err, junctions) {
	    if(err) res.send(err);
	    
	    var prop_ids = [];
	    junctions.forEach(function(junc) {
	        prop_ids.push(junc.PropertyId); 
	    });

	    //nin means not in
	    Property.find().nin('_id', prop_ids).exec(function(err, properties) {
	    	res.send(properties);
	    }); 
	});

};


	/*Property.find(function(err, props){
		if(err) res.send(err);
		console.log('properties: ' + JSON.stringify(props));
		var propJunction = [];
		props.forEach(function(entry) {
			PropertyJunction.create({
				email 		: req.body.email,
				phone		: req.body.phone,
				message		: req.body.message,
				PropertyId	: entry._id,
				tenant      : req.body.tenant_id
			}, function(err, aPropJunction){
				console.log('aJunction: ' + JSON.stringify(aPropJunction));
				propJunctions.push(aPropJunction);
			});
		});

		var finalRes = {
			"properties" : props,
			"junctions"	 : propJunctions
		};
		res.send(props);
	}) */

exports.getTestProps = function(req, res) {
	Property.find(function(err, props){
		res.send(props);
	})
};

// Called when hitting route
// /api/createPropJunctions
exports.createPropJunctions = function(req, res) {
	var newPropJunctions = req.body.property_junctions;
	console.log('got new property_junctions: ' + JSON.stringify(newPropJunctions));

	newPropJunctions.forEach(function(entry) {
		PropertyJunction.create({
			email 		: entry.email,
			phone		: entry.phone,
			message		: entry.message,
			PropertyId	: entry.property_id,
			tenant      : entry.tenant_id,
			swipeStatus : entry.swipe_status
		}, function(err, propJunctions) {
			if(err) res.send(err);
			res.send('successfully created prop junctions');
		});
	});
};

// Called when hitting route
// /api/createNewTenant
exports.createNewTenant = function(req, res) {
	var newTenant = req.body;
	console.log('creating new tenant with params: ' + JSON.stringify(newTenant));
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
