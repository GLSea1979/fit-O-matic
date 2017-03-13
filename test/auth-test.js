'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('fit-O-matic:auth-test');

const User = require('../model/user.js');
const PORT = process.env.PORT || 3000;
const url = `http://localhost:${PORT}`;

require('../server.js');

const sampleUser = {
  username: 'test username',
  email: 'test email',
  password: 'test password',
  admin: true
};

describe('Auth Routes', function(){
  describe('POST: /api/signup', function(){
    describe('with a valid body', function(){
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });
      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(sampleUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });
});
