'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('fit-O-matic:auth-route');

const User = require('../model/user.js');

const basicAuth = require('../lib/basic-auth-middleware.js');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next){
  debug('POST /api/signup');
  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});
