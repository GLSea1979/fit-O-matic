'use strict';

const request = require('superagent');
const expect = require('chai').expect;
const Promise = require('bluebird');
const mongoose = require('mongoose');
const debug = require('debug')('fit-O-matic:profile-route-test');

const User = require('../model/user.js');
const Profile = require('../model/profile.js');

mongoose.Promise = Promise;

const url = `http://localhost:${process.env.PORT}`;

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
  photo: 'doje.png'
};

const sampleBrandNewProfile = {
  name: 'Fresh New Profile Name',
  gender: 'yes',
  photo: 'katze.png'
};

describe.only('Profile Routes', function(){
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({})
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
    });//end GET
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
          debug('res.body ------->', res.body);
          expect(res.body.name).to.equal(sampleUpdatedProfile.name);
          expect(res.body.gender).to.equal(sampleUpdatedProfile.gender);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });

    describe('with an no body resulting in 400', () => {
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

  describe('POST: /api/profile', function(){
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

});//end profile route tests
