'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('fit-O-matic:auth-test');

const User = require('../model/user.js');
const PORT = process.env.PORT || 5000;
const url = `http://localhost:${PORT}`;

require('../server.js');

const sampleUser = {
  username: 'test username',
  email: 'test email',
  password: 'testpassword',
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
  describe('with an invalid body', function() {
    it('should return a 400 for a bad request', (done) => {
      request.post(`${url}/api/signup`)
      .send('nothing here')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

  describe('GET: /api/signin', function() {
    before( done => {
      let user = new User(sampleUser);
      debug('sample user password:', sampleUser.password);
      user.generatePasswordHash(sampleUser.password)
      .then( user => {
        debug('inside someting:', user);
        return user.save()

      })
      .then( user => {
        debug('somewhere else', user);
        this.tempUser = user;
        done();
      })
      .catch(done);
    });

    after( done => {
      User.remove({})
      .then( () => done())
      .catch(done);
    });

    it('should return a token', done => {
      request.get(`${url}/api/signin`)
      .auth('test username', 'testpassword')
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        done();
      });
    });

    describe('without a valid auth', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .auth('test username', 'wrong password')
        .end((err) => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
  });
});
