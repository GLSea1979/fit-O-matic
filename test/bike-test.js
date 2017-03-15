'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const debug = require('debug')('fit-O-matic:bike-route-test');

const Bike = require('../model/bike.js');
const Mfr = require('../model/mfr.js');
const User = require('../model/user.js');

const url = `http://localhost:${process.env.PORT}`;

require('../server.js');

const sampleBike = {
  bikeName: 'sample name',
  category: 'sample category',
  photoURI: 'photodest.jpg'
};

const sampleMfr = {
  name: 'sample name',
  website: 'overpricedbikes.com'
};

const sampleUser = {
  username: 'sample username',
  email: 'email@email.com',
  password: 'mr f',
  admin: true
};

describe('Bike Routes', function() {
  afterEach( done => {
    Promise.all([
      Bike.remove({}),
      Mfr.remove({}),
      User.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  describe('POST: /api/mfr/:mfrID/bike', function() {
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
    describe('with a valid body', () => {
      it('should return a new bike', done => {
        request.post(`${url}/api/mfr/${this.tempMfr._id}/bike`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send(sampleBike)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.bikeName).to.equal(sampleBike.bikeName);
          done();
        });
      });
    });
    describe('with an invalid body', () => {
      it('should return a new bike', done => {
        request.post(`${url}/api/mfr/${this.tempMfr._id}/bike`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({bad: 'data'})
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(err.message).to.equal('Bad Request');
          done();
        });
      });
    });
  });
  describe('GET /api/bike/:bikeID', function() {
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
    before( done => {
      sampleBike.mfrID = this.tempMfr._id;
      new Bike(sampleBike).save()
      .then(bike => {
        this.tempBike = bike;
        done();
      })
      .catch(done);
    });
    describe('with a valid bike ID', () => {
      it('should return a bike', done => {
        request.get(`${url}/api/bike/${this.tempBike._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.bikeName).to.equal(sampleBike.bikeName);
          done();
        });
      });
    });
    describe('with an invalid bike ID', () => {
      it('should return a bike', done => {
        request.get(`${url}/api/bike/58c9a29b0e7f6b54659c7c8a`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(err.message).to.equal('Bad Request');
          done();
        });
      });
    });
  });
});


