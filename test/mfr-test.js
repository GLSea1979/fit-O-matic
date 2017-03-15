'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('fit-O-matic:mfr-test');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Mfr = require('../model/mfr.js');
const url = `http://localhost:${process.env.PORT}`;

require('../server.js');

const sampleMfr = {
  name: 'test brand',
  website: 'www.testeroney.com'
};

const badSampleMfr = {
  website: 'www.testeroney.com'
};

const sampleUser = {
  username: 'samp',
  email: 'test email',
  password: 'test pass',
  admin: true
};

describe('Mfr Routes', function(){
  afterEach( done => {
    Promise.all([
      Mfr.remove({}),
      User.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/mfr', function() {
    before( done => {
      new User(sampleUser)
      .generatePasswordHash(sampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    describe('with a valid body', () => {
      it('should return a new mfr', done => {
        request.post(`${url}/api/mfr`)
          .send(sampleMfr)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.body.name).to.equal(sampleMfr.name);
            expect(res.status).to.equal(200);
            done();
          });
      });
    });//end valid post

    describe('with an invalid body', () => {
      it('should return a error with missing name', done => {
        request.post(`${url}/api/mfr`)
          .send(badSampleMfr)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .end((err, res) => {
            // if(err) return done(err);
            // expect(res.body.name).to.equal(sampleMfr.name);
            expect(err.message).to.equal('Bad Request');
            expect(res.status).to.equal(400);
            done();
          });
      });
      it('should return a error with missing website', done => {
        request.post(`${url}/api/mfr`)
          .send({name: 'taaaaast!'})
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .end((err, res) => {
            // if(err) return done(err);
            // expect(res.body.name).to.equal(sampleMfr.name);
            expect(err.message).to.equal('Bad Request');
            expect(res.status).to.equal(400);
            done();
          });
      });
    });//end invalid POST
    describe('with no token', () => {
      it('should return a error for no token', done => {
        request.post(`${url}/api/mfr`)
          .send(sampleMfr)
          .end((err, res) => {
            // if(err) return done(err);
            // expect(res.body.name).to.equal(sampleMfr.name);
            expect(err.message).to.equal('Unauthorized');
            expect(res.status).to.equal(401);
            done();
          });
      });
    });
  });
  describe('GET: /api/mfr/:id', function() {
    before( done => {
      new User(sampleUser)
      .generatePasswordHash(sampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    before( done => {
      new Mfr(sampleMfr).save()
      .then( mfr => {
        this.tempMfr = mfr;
        done();
      })
      .catch(done);
    });
    describe('with a valid id', () => {
      it('should return a mfr', done => {
        request.get(`${url}/api/mfr/${this.tempMfr._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(sampleMfr.name);
          done();
        });
      });
    });
  });//end Mfr Routes
});
