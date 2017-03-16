// 'use strict';
//
// const expect = require('chai').expect;
// const request = require('superagent');
// const debug = require('debug')('fit-O-matic:basic-route-test');
//
// const PORT = process.env.PORT || 5000;
// const url = `http://localhost:${PORT}`;
//
// require('../server.js');

'use strict';

const expect = require('chai').expect;
const request = require('superagent');
// const debug = require('debug')('fit-O-matic:auth-test');

// const User = require('../model/user.js');
const PORT = process.env.PORT || 5000;
const url = `http://localhost:${PORT}`;

require('../server.js');


describe('Basic Routes', function() {
  describe('GET: /', function() {
    it('should return a 200', done => {
      request.get(`${url}/`)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});
