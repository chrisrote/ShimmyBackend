var should = require('should');
var assert = require('assert');
var request = require('supertest'); 
var mongoose = require('mongoose');
var winston = require('winston');
var Property            = require('../app/models/property');
var PropertyJunction    = require('../app/models/property_junction');
var Tenant              = require('../app/models/tenant');

describe('tenant api: ', function() {
    var host = 'localhost:5000'
    var test_junction;
    var test_property;
    var test_tenant;

    before(function(done) {
        mongoose.connect('mongodb://th:Shimmy@ds053638.mongolab.com:53638/shimmy');
        done();
    });

    describe('create new tenant', function() {
        it('should return a new tenant', function(done) {
            var body = {
                email           : 'email',
                phone           : 'phone',
                searchOpts      : '{test:val}',
                contactMessage  : 'test message',
                roomates        : '{test:roommates}',
                fb_id           : '02020',
                fb_token        : '029383'
            }; 
            request(host).post('/api/createNewTenant').send(body).end(function(err, res) {
                if(err) throw err;
                res.should.have.status(200);
                done();
            });
        });
    });

    describe('get all properties', function() {
        it('should return all properties', function(done) {
            request(host).get('/api/allProps').send().end(function(err, res) {
                if(err) throw err;
                res.should.have.status(200);
                done();
            });
        });
    });

    describe('setting property junctions', function() {
        it('should set property junctions to swipe status value', function(done) {
            var aJunc = PropertyJunction.create({
                swipeStatus : 1,
                email : 'testing!'
            }, function(err, aJunction) {
                var body = { property_junctions : [aJunction] };
                request(host).post('/api/setPropertyJunctions').send(body).end(function(err, res) {
                    if(err) throw err;
                    res.should.have.status(200);
                    res.body.should.have.property('updated');
                    done();
                });
            });
        });
    });

    describe('getting properties for tenant', function() {
        it('should return properties and junctions with status of -1', function(done){
            Tenant.create({
                email           : 'test',
                phone           : 'test'            
            }, function(err, aTenant) {
                var body = { 
                    email : "tyler.harrington1989@gmail.com", 
                    message: "I'd like to view this property!", 
                    "tenant_id" : aTenant._id, 
                    "searchOpts" : {
                        bathsMin : "0",
                        bedsMax : "10",
                        bathsMax : "10",
                        neighborhoods : [
                            "All Neighborhoods"
                        ],
                        priceHigh : "1000000",
                        priceLow : "0",
                        bedsMin : "0"
                    } 
                };
                request(host).post('/api/propsForTenant').send(body).end(function(err, res) {
                    if(err) throw err;
                    res.should.have.status(200);
                    res.body.should.have.property('properties');
                    res.body.should.have.property('junctions');
                    done();
                });
            });
        });
    });

    describe('delete unused property junctions',function() {
        it('should delete junctions and return with status 200', function(done) {
            Tenant.create({
                email           : 'test',
                phone           : 'test'            
            }, function(err, tenant) {
                request(host).del('/api/deleteUnusedJunctionsForTenant/' + tenant._id).send().end(function(err, res) {
                    if(err) throw err;
                    res.should.have.status(200);
                    res.body.should.have.property('deleted');
                    done();
                });
            });
        });
    });
});








