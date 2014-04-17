var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var winston = require('winston');

describe('Routing', function() {
  var host_url = 'localhost:5000';

  // run all setup operations
  before(function(done) {
    mongoose.connect('mongodb://localhost/27017/test');
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


/*
it('should correctly update an existing account', function(done){
	var body = {
		firstName: 'JP',
		lastName: 'Berd'
	};
	request(url)
		.put('/api/profiles/vgheri')
		.send(body)
		.expect('Content-Type', /json/)
		.expect(200) //Status code
		.end(function(err,res) {
			if (err) {
				throw err;
			}
			// Should.js fluent syntax applied
			res.body.should.have.property('_id');
	                res.body.firstName.should.equal('JP');
	                res.body.lastName.should.equal('Berd');
	                res.body.creationDate.should.not.equal(null);
			done();
		});
	});
  });
  */
