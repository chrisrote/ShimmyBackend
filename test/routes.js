var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var winston = require('winston');

describe('Routing', function() {
  var host_url = 'localhost:5000';

  // run all setup operations
  before(function(done) {
    mongoose.connect('mongodb://th:Shimmy@ds053638.mongolab.com:53638/shimmy');
    done();
  });

  describe('Properties', function() {
    it('should return properties', function(done) {
      request(host_url).get('/api/property').send().end(function(err, res) {
        if(err) {
          throw err;
        }

        res.should.have.status(200);
        done();
      });
    });
  });
});

