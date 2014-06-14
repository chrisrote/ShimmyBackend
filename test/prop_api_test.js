var should = require('should');
var assert = require('assert');
var request = require('supertest'); 
var mongoose = require('mongoose');
var winston = require('winston');
var Property            = require('../app/models/property');
var PropertyJunction    = require('../app/models/property_junction');
var Tenant              = require('../app/models/tenant');

describe('property api: ', function() {
    var host = 'localhost:5000';

    describe('create new property', function() {
        it('should return a new property', function(done) {
            var body = {
                name           	: 'test',
                price           : 'test',
                street      	: '1600 n wells',
                city  			: 'chicago',
                zip        		: '60610',
                suite           : 'test',
                state        	: 'IL',
                description    	: 'test',
                numBeds        	: 'test',
                numBaths      	: 'test',
                user  			: '1111'
            }; 
            request(host).post('/api/property').send(body).end(function(err, res) {
                if(err) throw err;
                res.header['location'].should.include('/')
                done();
            });
        });
    });

});