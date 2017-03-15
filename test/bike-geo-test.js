'use strict';

const request = require('superagent');
const expect = require('chai').expect;
const Promise = require('bluebird');
const debug = require('debug')('fit-O-matic:bike-geo-route-test');

const User = require('../model/user.js');
const Mfr = require('../model/mfr.js');
const BikeGeo = require('../model/geometry.js');
const BikeProfile = require('../model/bike.js');
const bikeAlgorithm = require('../lib/basic-fit-algorithm.js');

const url = `http://localhost:${process.env.PORT}`;

require('../server.js');
const sampleMfr = {
  name: 'sample mfr',
  website: 'sample.com'
};
const sampleBikeProfile = {
  bikeName: 'test name',
  category: 'test category',
  photoURI: 'emmereffer.jpg'
};
const sampleBikeGeo = {
  bikeSizeName: 'test size',
  topTubeLength: 52,
  bikeID: []
};
const sampleUser = {
  username: 'test username',
  email: 'test email',
  password: 'testpassword',
  admin: true
};

const sampleMeasure =  {
  height: 172.72,
  inseam: 80.01,
  result: bikeAlgorithm.basicfit(172.7, 80.01)
};

describe('Bike Geometry Routes', function() {
  afterEach( done => {
    Promise.all([
      BikeGeo.remove({}),
      BikeProfile.remove({}),
      User.remove({}),
      Mfr.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  before( done => {
    new Mfr(sampleMfr).save()
    .then( mfr => {
      this.tempMfr = mfr;
    })
    .catch(done);

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
  describe('POST /api/bike/:bikeID/geometry', () => {
    before( done => {
      sampleBikeProfile.mfrID = this.tempMfr._id;
      new BikeProfile(sampleBikeProfile).save()
      .then(bike => {
        this.tempBike = bike;
        done();
      })
      .catch(done);
    });
    before( done => {
      sampleBikeGeo.bikeID.push(this.tempBike._id);
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

  describe('GET: /api/geo/:id', function() {

    before( done => {
      new Mfr(sampleMfr).save()
      .then( mfr => {
        this.tempMfr = mfr;
      })
      .catch(done);

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

    before( done => {
      sampleBikeProfile.mfrID = this.tempMfr._id;
      new BikeProfile(sampleBikeProfile).save()
      .then(bike => {
        this.tempBike = bike;
        done();
      })
      .catch(done);
    });

    before( done => {
      sampleBikeGeo.bikeID.push(this.tempBike._id);
      new BikeGeo(sampleBikeGeo).save()
      .then( bikeGeo => {
        this.tempBikeGeo = bikeGeo;
        done();
      })
      .catch(done);
    });

    // before( done => {
    //
    // });
    it('should return a bike geometry object', done => {
      request.get(`${url}/api/geo/${sampleMeasure.height}/${sampleMeasure.inseam}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        // if (err) return done(err);
        debug('HERE ARE OUR RESSUULLTSL:', sampleMeasure.result);
        debug('BODYYYYYYY',res.body);
        expect(res.status).to.equal(200);
        //expect(res.topTube).to.equal(sampleMeasure.result);
        done();
      });
    });
  });

});
