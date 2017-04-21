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
const sampleBikeProfile2 = {
  bikeName: 'test name2',
  category: 'test category2',
  photoURI: 'emmereffer2.jpg'
};
const sampleBikeGeo = {
  bikeSizeName: 'test size',
  topTubeLength: 52,
  bikeID: []
};
const sampleBikeGeo2 = {
  bikeSizeName: 'test size2',
  topTubeLength: 50,
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

const sampleMeasure2 = {
  height: 167.42,
  inseam: 76.10,
  result: bikeAlgorithm.basicfit(167.42, 76.10)
};

const sampleMeasure3 = {
  height: 162.73,
  inseam: 82.19,
  result: bikeAlgorithm.basicfit(162.73, 82.19)
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
    describe('with a valid bike ID', () => {
      it('should return 200 with a new bike geometry', done => {
        request.post(`${url}/api/bike/${this.tempBike._id}/geometry`)
        .send(sampleBikeGeo)
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
    describe('with an malformed bike ID', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/bike/badbikeID/geometry`)
        .send(this.tempBikeGeo)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err.message).to.equal('Bad Request');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('with an invalid bike ID', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/bike/${this.tempBike._id.toString().slice(0, -3)}ccc/geometry`)
        .send(this.tempBikeGeo)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err.message).to.equal('Bad Request');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });  });
  describe('POST /api/geometry', () => {

    describe('with a body', () => {
      it('should return 200 with a new bike geometry', done => {
        request.post(`${url}/api/geo`)
        .send(sampleBikeGeo)
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
  describe('GET: /api/geo/:geoID', function() {

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

    it('should return a bike geometry object', done => {
      request.get(`${url}/api/geo/${this.tempBikeGeo._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        debug(res.body, 'first one by ID');
        expect(res.status).to.equal(200);
        expect(res.body.bikeSizeName).to.equal(this.tempBikeGeo.bikeSizeName);
        expect(res.body.topTubeLength).to.equal(sampleMeasure.result);
        done();
      });
    });
    it('should return a 400 with an invalid id', done => {
      request.get(`${url}/api/geo/58f2b7eeeaace9dbc827247f`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(err.message).to.equal('Bad Request');
        expect(res.status).to.equal(400);
        done();
      });
    });
  });
  describe('GET: /api/geo/?querystring', function() {

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
      sampleBikeProfile2.mfrID = this.tempMfr._id;
      new BikeProfile(sampleBikeProfile).save()
      .then(bike => {
        this.tempBike = bike;
        new BikeProfile(sampleBikeProfile2).save()
        .then( bike => {
          this.tempBike2 = bike;
          done();
        });
      })
      .catch(done);
    });

    before( done => {
      sampleBikeGeo.bikeID.push(this.tempBike._id);
      sampleBikeGeo.bikeID.push(this.tempBike2._id);
      sampleBikeGeo2.bikeID.push(this.tempBike._id);
      sampleBikeGeo2.bikeID.push(this.tempBike2._id);
      new BikeGeo(sampleBikeGeo).save()
      .then( bikeGeo => {
        this.tempBikeGeo = bikeGeo;
        new BikeGeo(sampleBikeGeo2).save()
        .then( bikeGeo => {
          this.tempBikeGeo2 = bikeGeo;
          done();
        });
      })
      .catch(done);
    });

    it('should return a bike geometry object', done => {

      request.get(`${url}/api/geo/?height=${sampleMeasure.height}&inseam=${sampleMeasure.inseam}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        debug(res.body, 'first one');
        expect(res.status).to.equal(200);
        expect(res.body.geo[0].bikeID[1].bikeName).to.equal(this.tempBike2.bikeName);
        expect(res.body.topTube).to.equal(sampleMeasure.result);
        done();
      });
    });

    it('should return a different bike geometry object', done => {
      request.get(`${url}/api/geo/?height=${sampleMeasure2.height}&inseam=${sampleMeasure2.inseam}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        debug(res.body, 'second one');
        expect(res.status).to.equal(200);
        expect(res.body.topTube).to.equal(sampleMeasure2.result);
        done();
      });
    });

    it('should return a different bike geometry object', done => {
      request.get(`${url}/api/geo/?height=${sampleMeasure3.height}&inseam=${sampleMeasure3.inseam}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        debug(res.body, 'second one');
        expect(res.status).to.equal(200);
        expect(res.body.topTube).to.equal(sampleMeasure3.result);
        done();
      });
    });

    it('should return a 400 with missing height', done => {
      request.get(`${url}/api/geo/?height=&inseam=${sampleMeasure.inseam}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(err.message).to.equal('Bad Request');
        expect(res.status).to.equal(400);
        done();
      });
    });
    it('should return a 400 with missing inseam', done => {
      request.get(`${url}/api/geo/?height=${sampleMeasure.height}&inseam=`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(err.message).to.equal('Bad Request');
        expect(res.status).to.equal(400);
        done();
      });
    });
  });
  describe('PUT /api/geo/geoID', function() {
    before( done => {
      new Mfr(sampleMfr).save()
      .then( mfr => {
        this.tempMfr = mfr;
        done();
      })
      .catch(done);
    });
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
    describe('with a valid ID and Body', () => {
      it('should return a 200 with updated content', done => {
        request.put(`${url}/api/geo/${this.tempBikeGeo._id}`)
        .send({bikeSizeName: 'updated name'})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.bikeSizeName).to.equal('updated name');
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
    describe('with an invalid ID', () => {
      it('should return a 404', done => {
        request.put(`${url}/api/geo/58c8b114cc85c0838a2a0765`)
        .send({bikeSizeName: 'updated name'})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err.message).to.equal('Not Found');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('with a malformed ID', () => {
      it('should return a 400', done => {
        request.put(`${url}/api/geo/badId`)
        .send({bikeSizeName: 'updated name'})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err.message).to.equal('Bad Request');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });
});
