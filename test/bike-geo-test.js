'use strict';

const request = require('superagent');
const expect = require('chai').expect;
const Promise = require('bluebird');

const User = require('../model/user.js');
const BikeGeo = require('../model/geometry.js');
const BikeProfile = require('../model/bike.js');

const url = `http://localhost:${process.env.PORT}`;

require('../server.js');

const sampleBikeProfile = {
  bikeName: 'test name',
  manufacturer: 'test manufacturer',
  category: 'test category'
};
const sampleBikeGeo = {
  bikeSizeName: 'test size',
  topTubeLength: 50,
};
const sampleUser = {
  username: 'test username',
  email: 'test email',
  password: 'testpassword',
  admin: true
};

describe('Bike Geometry Routes', function() {
  afterEach( done => {
    Promise.all([
      BikeGeo.remove({}),
      BikeProfile.remove({}),
      User.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });
  before( done => {
    let user = new User(sampleUser);
    user.generatePasswordHash(sampleUser.password)
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
  describe('POST api/bike/:bikeID/geometry', () => {
    before( done => {
      new BikeProfile(sampleBikeProfile).save()
      .then(bike => {
        this.tempBike = bike;
        done();
      })
      .catch(done);
    });
    before( done => {
      sampleBikeGeo.bikeProfileID = this.tempBike._id;
      new BikeGeo(sampleBikeGeo).save()
      .then( bikeGeo => {
        this.tempBikeGeo = bikeGeo;
        done();
      })
      .catch(done);
    });
    describe('with a valid bike ID', () => {
      it('should return 200 with a new bike geometry', done => {
        request.post(`${url}/api/bike/${this.tempBike._id}/geometry`)
        .send(this.tempBikeGeo)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });
});
