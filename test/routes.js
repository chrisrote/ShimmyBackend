var should = require('should');
var assert = require('assert');
var supertest = require('supertest');
var mongoose = require('mongoose');
var winston = require('winston');
var api = supertest('http://localhost:5000');

describe('tenant api: ', function() {
    var host = 'localhost:5000'

    before(function(done) {
        mongoose.connect('mongodb://th:Shimmy@ds053638.mongolab.com:53638/shimmy');
        done();
    });

    describe('create new tenant', function() {
        it('should return a new tenant', function(done) {
            supertest.request(host).post('/api/createNewTenant').send().end(function(err, res) {
                if(err) throw err;
                res.should.have.status(200);
            });
        });
    });
});

