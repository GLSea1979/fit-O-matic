'use strict';

const request = require('superagent');
const expect = require('chai').expect;
const Promise = require('bluebird');
const mongoose = require('mongoose');
const debug = require('debug')('fit-O-matic:profile-route-test');
const del = require('del');

const Mfr = require('../model/mfr.js');
const User = require('../model/user.js');
const Bike = require('../model/bike.js');
const Geo = require('../model/geometry.js');
const Profile = require('../model/profile.js');

mongoose.Promise = Promise;

const s3methods = require('../lib/s3-methods.js');

const url = `http://localhost:${process.env.PORT}`;
const dataDir = `${__dirname}/../data`;

require('../server.js');

const sampleUser = {
  username: 'test user',
  email: 'testemail@email.com',
  password: 'thepassword',
  admin: false
};
const sampleProfile = {
  name: 'tested',
  gender: 'man',
  photo: 'sweetphoto.png'
};
const sampleUpdatedProfile = {
  name: 'Mr. Updated Name Property!!!',
  gender: 'woman',
  photo: 'doje.png',
  geoID: []
};

const sampleBrandNewProfile = {
  name: 'Fresh New Profile Name',
  gender: 'yes',
  photo: 'katze.png'
};

const sampleGeo = {
  bikeSizeName: 'new size for you',
  bikeID: []
};

const sampleBike = {
  bikeName: 'schwinn',
  category: 'cruiser',
  photoURI: 'bigblue'
};

const sampleBike2 = {
  bikeName: 'schwinny',
  category: 'cruisery',
  photoURI: 'bigblue8'
};

const sampleMfr = {
  name: 'mongoose',
  website: 'www.noooo.com'
};

describe('Profile Routes', function(){
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({}),
      Geo.remove({}),
      Bike.remove({}),
      Mfr.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  describe('GET: /api/profile/:id', function(){
    describe('with a valid ID', () => {
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
        sampleProfile.userID = this.tempUser._id;
        new Profile(sampleProfile).save()
        .then( profile => {
          this.tempProfile = profile;
          done();
        })
        .catch(done);
      });
      it('should return a valid profile', done => {
        request.get(`${url}/api/profile/${this.tempUser._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('tested');
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('with an invalid ID', () => {
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
        sampleProfile.userID = this.tempUser._id;
        new Profile(sampleProfile).save()
        .then( profile => {
          this.tempProfile = profile;
          done();
        })
        .catch(done);
      });
      it('should return a 400 for CastError', done => {
        request.get(`${url}/api/profile/:ohnooo`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
      });
    });
  });








  describe('GET: api/favorites/profile/${userID}', function(){
    describe('with a valid ID', () => {
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
        sampleProfile.userID = this.tempUser._id;
        new Profile(sampleProfile).save()
        .then( profile => {
          this.tempProfile = profile;
          done();
        })
        .catch(done);
      });
      it('should return a valid profile', done => {
        request.get(`${url}/api/favorites/profile/${this.tempUser._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          // expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('with an invalid ID', () => {
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
        sampleProfile.userID = this.tempUser._id;
        new Profile(sampleProfile).save()
        .then( profile => {
          this.tempProfile = profile;
          done();
        })
        .catch(done);
      });
      it('should return a 400 for CastError', done => {
        request.get(`${url}/api/favorites/profile/:ohnooooo`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^', res.status);
        expect(res.status).to.equal(400);
        done();
      });
      });
    });
  });









  describe('PUT: /api/profile/:id', function(){
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
    });//end before

    before( done => {
      sampleProfile.userID = this.tempUser._id;
      new Profile(sampleProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });

    describe('with a valid request body', () => {
      it('should return an updated profile object', done => {
        request.put(`${url}/api/profile/${this.tempProfile._id}`)
        .send(sampleUpdatedProfile)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.name).to.equal(sampleUpdatedProfile.name);
          expect(res.body.gender).to.equal(sampleUpdatedProfile.gender);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });

    describe('with an bad id resulting in 400', () => {
      it('should return an error', done => {
        request.put(`${url}/api/profile/bad`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('without a body attached resulting in 400', () => {
      it('should return an error', done => {
        request.put(`${url}/api/profile/${this.tempProfile._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });





  describe('PUT: /api/favorites/profile/${profile._id}', function(){
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
    });//end before

    before( done => {
      sampleProfile.userID = this.tempUser._id;
      new Profile(sampleProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });
    describe('with a valid request', () => {
      it('should return an updated profile', done => {
        request.put(`${url}/api/favorites/profile/${this.tempProfile._id}`)
        .send(sampleUpdatedProfile)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.name).to.equal(sampleUpdatedProfile.name);
          expect(res.body.gender).to.equal(sampleUpdatedProfile.gender);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });


    describe('without a file attached resulting in 400', () => {
      it('should return an error', done => {
        request.put(`${url}/api/favorites/profile/${this.tempProfile._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('without a body attached resulting in 400', () => {
      it('should return an error', done => {
        request.put(`${url}/api/favorites/profile/${this.tempProfile._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .type('text/plain')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('without an auth header resulting in 401', () => {
      it('should return an error', done => {
        request.put(`${url}/api/favorites/profile/${this.tempProfile._id}`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });








  describe('PUT: /api/profile/photo/:id', function(){
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
    });//end before

    before( done => {
      sampleProfile.userID = this.tempUser._id;
      new Profile(sampleProfile).save()
      .then( profile => {
        this.tempProfile = profile;
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
          debug('photo deleted');
          done();
        });
      }
    });
    describe('with a valid request body and photo file', () => {
      it('should return an updated profile object', done => {
        request.put(`${url}/api/profile/photo/${this.tempProfile._id}`)
        .attach('image', `${__dirname}/data/test.jpg`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.photoURI).to.not.equal(undefined);
          expect(res.status).to.equal(200);
          this.tempKey = res.body.photoKey;
          done();
        });
      });
    });

    describe('without a file attached resulting in 400', () => {
      it('should return an error', done => {
        request.put(`${url}/api/profile/photo/${this.tempProfile._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('without a body attached resulting in 400', () => {
      it('should return an error', done => {
        request.put(`${url}/api/profile/photo/${this.tempProfile._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .type('text/plain')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('without an auth header resulting in 401', () => {
      it('should return an error', done => {
        request.put(`${url}/api/profile/photo/${this.tempProfile._id}`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/profile/:id', function(){
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
    });//end before

    before( done => {
      sampleProfile.userID = this.tempUser._id;
      new Profile(sampleProfile).save()
        .then( profile => {
          this.tempProfile = profile;
          done();
        })
        .catch(done);
    });
    describe('with a valid id', () => {
      it('should return a 204 response for deleting a profile', done => {
        request.delete(`${url}/api/profile/${this.tempProfile._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(204);
            done();
          });
      });
    });
  });

  describe('POST: /api/profile/:id', function(){
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
    });//end before
    describe('with a valid request body', () => {
      it('should return a new profile object', done => {
        request.post(`${url}/api/profile/${this.tempUser._id}`)
        .send(sampleBrandNewProfile)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });//end POST

  describe('GET: api/profile/:id/bikes', function() {
    before(done => {
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
      .then( bike => {
        this.tempBike = bike;
        done();
      })
      .catch(done);
    });
    before( done => {
      sampleGeo.bikeID.push(this.tempBike._id);
      new Geo(sampleGeo).save()
      .then( geo => {
        this.tempGeo = geo;
        done();
      })
      .catch(done);
    });
    before( done => {
      sampleUpdatedProfile.userID = this.tempUser._id;
      sampleUpdatedProfile.geoID.push(this.tempGeo._id);
      new Profile(sampleUpdatedProfile).save()
      .then( profile => {

        this.tempProfile = profile;

        done();
      })
      .catch(done);
    });

    describe('with a valid id', () => {
      it('should return a populated profile array of geos', done => {
        request.get(`${url}/api/profile/${this.tempUser._id}/bikes`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(sampleUpdatedProfile.name);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(res.body.geoID.length).to.equal(1);
          done();
        });
      });
    });
  });
});//end profile route tests
