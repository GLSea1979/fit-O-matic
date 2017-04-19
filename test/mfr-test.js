'use strict';

const debug = require('debug')('fit-O-matic:mfr-test');
const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');

const Mfr = require('../model/mfr.js');
const User = require('../model/user.js');
const BikeProfile = require('../model/bike.js');
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

    describe('with an invalid id format', () => {
      it('should return a bad request', done => {
        request.get(`${url}/api/mfr/454321`)
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
    describe('with an invalid id of proper formatting', () => {
      it('should return a 400', done => {
        request.get(`${url}/api/mfr/58f27f508c00b7cd3721bccc`)
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
    describe('without any id', () => {
      it('should return a 404', done  => {
        request.get(`${url}/api/mfr/`)
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
  });
  describe('GET: /api/mfrs', function() {
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
    describe('with a valid request', () => {
      it('should return all mfrs', done => {
        request.get(`${url}/api/mfrs`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body[0].name).to.equal(sampleMfr.name);
          done();
        });
      });
    });
  });
  describe('GET: /api/mfrs', function() {
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
    describe('with a valid request but no mfrs', () => {
      it('should return a 204', done => {
        request.get(`${url}/api/mfrs`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
  });
  describe('PUT: /api/routes/mfr/:id', () => {
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
    describe('with a valid ID and body', () => {
      it('should return an updated name', done => {
        request.put(`${url}/api/mfr/${this.tempMfr._id}`)
        .send({name: 'updated name'})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.name).to.equal('updated name');
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
    describe('with an invalid ID that is properly formatted', () => {
      it('should return a 400', done => {
        request.put(`${url}/api/mfr/58f28756091787d02b3a77a9`)
        .send({name: 'updated name'})
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
  describe('DELETE: /api/mfr/:id', function() {
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
      sampleBikeProfile.mfrID = this.tempMfr._id;
      new BikeProfile(sampleBikeProfile).save()
      .then(bike => {
        this.tempBike = bike;
        done();
      })
      .catch(done);
    });
    describe('with a valid id', () => {
      it('should do something like delete a mfr and bikes by ids', done => {
        request.delete(`${url}/api/mfr/${this.tempMfr._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
    describe('with an invalid id', () => {
      it('should return a 400', done => {
        request.delete(`${url}/api/mfr/58f28756091787d02b3a77a8`)
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
  });//end Mfr Routes
});
