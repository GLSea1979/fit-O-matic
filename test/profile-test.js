'use strict';

const request = require('superagent');
const expect = require('chai').expect;
const Promise = require('bluebird');
const debug = require('debug')('fit-O-matic:profile-test');

const User = require('../model/user.js');
const Profile = require('../model/profile.js');

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

describe('Profile Routes', function(){
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  describe('GET: /api/profile/:id', function(){
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
    describe('with a valid ID', () => {
      debug('**********************************************0293203920932093092039203992039203920392*********');
      it('should return a profile', done => {
        request.get(`${url}/api/profile/${this.tempUser._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          debug('HERE IS THE res body', res.body);
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('tested');
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
  });
});
