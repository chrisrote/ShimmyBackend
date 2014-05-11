'use strict';

var Property 			= require('../models/property');
var PropertyJunction 	= require('../models/property_junction');
var Tenant				= require('../models/tenant');

// Called when hitting route
// /api/propsForTenant
exports.getPropsForTenant = function(req, res) {
	Property.find(function(err, props){
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
	})
};

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
	var newTenant = req.body.myNewTenant;
	Tenant.create({

	}, function(err, tenants){
		if(err) res.send('failed to create tenant');
		res.send(tenants[0]);
	})
};
