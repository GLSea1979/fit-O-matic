'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const debug = require('debug')('fit-O-matic:bike-route-test');
const del = require('del');

const Bike = require('../model/bike.js');
const Mfr = require('../model/mfr.js');
const User = require('../model/user.js');

const s3methods = require('../lib/s3-methods.js');

const url = `http://localhost:${process.env.PORT}`;
const dataDir = `${__dirname}/../data`;

require('../server.js');

const sampleBike = {
  bikeName: 'sample name',
  category: 'sample category',
  photoKey: 'photodest.jpg',
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
      Promise.all([
        Bike.remove({}),
        Mfr.remove({}),
        User.remove({})
      ])
      .then( () => done())
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
      new Mfr(sampleMfr).save()
      .then( mfr => {
        this.tempMfr = mfr;
        done();
      })
      .catch(done);
    });
    after( done => {
      if(this.tempKey) {
        let params = {
          Bucket: process.env.AWS_BUCKET,
          Key: this.tempKey
        };
        s3methods.deleteObjectProm(params)
        .then( () => {
          del([`${dataDir}/*`]);
          done();
        });
      }
    });

    describe('with a valid body', () => {
      it('should return a new ike', done => {
        request.post(`${url}/api/mfr/${this.tempMfr._id}/bike`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('bikeName', sampleBike.bikeName)
        .field('category', sampleBike.category)
        .attach('image', `${__dirname}/data/test.jpg`)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.bikeName).to.equal(sampleBike.bikeName);
          this.tempKey = res.body.photoKey;
          done();
        });
      });
    });
    describe('with a missing bikeName', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/mfr/${this.tempMfr._id}/bike`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('category', sampleBike.category)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(err.message).to.equal('Bad Request');
          done();
        });
      });
    });
    describe('with a missing category', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/mfr/${this.tempMfr._id}/bike`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('bikeName', sampleBike.bikeName)
        .field('category', sampleBike.category)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(err.message).to.equal('Bad Request');
          done();
        });
      });
    });
    describe('with a missing file', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/mfr/${this.tempMfr._id}/bike`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('bikeName', sampleBike.bikeName)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(err.message).to.equal('Bad Request');
          done();
        });
      });
    });
    describe('with a bad mfr', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/mfr/58ca0b582604d19172211e44/bike`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('bikeName', sampleBike.bikeName)
        .attach('image', `${__dirname}/data/test.jpg`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(err.message).to.equal('Bad Request');
          done();
        });
      });
    });
    describe('without an auth token', () => {
      it('should return a 401', done => {
        request.post(`${url}/api/mfr/${this.tempMfr._id}/bike`)
        .set({
          Authorization: 'Bearer '
        })
        .send(sampleBike)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });
    describe('without an auth header', () => {
      it('should return a 401', done => {
        request.post(`${url}/api/mfr/${this.tempMfr._id}/bike`)
        .send(sampleBike)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
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
      it('should return an error', done => {
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
  describe('GET api/bikes', () => {
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
    describe('Request of all bikes with bikes in DB', () => {
      it('should return a list of all bikes', done  => {
        request.get(`${url}/api/all/bikes`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body[0].name).to.equal(sampleBike.name);
          done();
        });
      });
    });
    //TODO: fix this
    describe('With an empty bikes DB', () => {
      it('should return a 204', done => {
        Bike.remove({})
        .then( () => {
          request.get(`${url}/api/all/bikes`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).to.equal(204);
            expect(res.body.name).to.equal(undefined);
            done();
          });
        });
      });
    });
  });
  describe('GET api/bikes/:mfrID', () => {
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
    describe('Request of all bikes from a mfr', () => {
      it('should return a list of all bikes from mfr', done  => {
        request.get(`${url}/api/bikes/${this.tempMfr._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body[0].name).to.equal(sampleBike.name);
          done();
        });
      });
    });
  });
  describe('PUT: /api/bike/:bikeID', function() {
    before( done => {
      Promise.all([
        Bike.remove({}),
        Mfr.remove({}),
        User.remove({})
      ])
      .then( () => done())
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
    // after( done => {
    //   if(this.tempKey) {
    //     let params = {
    //       Bucket: process.env.AWS_BUCKET,
    //       Key: this.tempKey
    //     };
    //     s3methods.deleteObjectProm(params)
    //     .then( () => {
    //       del([`${dataDir}/*`]);
    //       done();
    //     });
    //   }
    // });


    describe('with a valid body', () => {
      it('should return an updated bike', done => {
        request.put(`${url}/api/bike/${this.tempBike._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        // .field('bikeName', this.tempBike.bikeName)
        // .field('category', this.tempBike.category)
        // .attach('image', `${__dirname}/data/test.jpg`)
        .send({bikeName: this.tempBike.bikeName})
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.bikeName).to.equal(sampleBike.bikeName);
          this.tempKey = res.body.photoKey;
          done();
        });
      });
    });
  });
  describe('PUT: /api/photo/bike/:bikeID', function() {
    before( done => {
      Promise.all([
        Bike.remove({}),
        Mfr.remove({}),
        User.remove({})
      ])
      .then( () => done())
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
    after( done => {
      if(this.tempKey) {
        let params = {
          Bucket: process.env.AWS_BUCKET,
          Key: this.tempKey
        };
        s3methods.deleteObjectProm(params)
        .then( () => {
          del([`${dataDir}/*`]);
          done();
        });
      }
    });


    describe('with a valid body', () => {
      it('should return an updated bike with photo', done => {
        request.put(`${url}/api/photo/bike/${this.tempBike._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('bikeName', this.tempBike.bikeName)
        .field('category', this.tempBike.category)
        .attach('image', `${__dirname}/data/test.jpg`)
        //.send({bikeName: this.tempBike.bikeName})
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.bikeName).to.equal(sampleBike.bikeName);
          this.tempKey = res.body.photoKey;
          done();
        });
      });
    });
  });
});
