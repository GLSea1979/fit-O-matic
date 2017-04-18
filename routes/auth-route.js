'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const debug = require('debug')('fit-O-matic:auth-route');

const Profile = require('../model/profile.js');
const User = require('../model/user.js');

const basicAuth = require('../lib/basic-auth-middleware.js');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next){
  debug('POST /api/signup');
  if (!req.body.username) return next(createError(400, 'need username'));
  if (!req.body.admin) return next(createError(400, 'need admin'));
  if (!req.body.email) return next(createError(400, 'need an email'));
  if (!req.body.password) return next(createError(400, 'need a password'));

  let password = req.body.password;
  delete req.body.password;
  let user = new User(req.body);
  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => {
    let profile = new Profile();
    profile.userID = user._id;
    profile.save();
  })
  .then( () => {
    return user.generateToken();
  })
  .then( token => {
    let authObj = {};
    authObj.token = token;
    authObj.userId = user._id;
    authObj.email = user.email;
    res.send(authObj);
  })
  .catch(next);
});

authRouter.get('/api/signin', basicAuth, function(req, res, next){
  debug('GET: /api/signin');
  let authObj = {};
  User.findOne({username: req.auth.username})
  .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => {
    authObj.userId = user._id;
    authObj.username = user.username;
    authObj.email = user.email;
    return user.generateToken();
  })
  .then( token => {
    authObj.token = token;
    debug(authObj, 'AUTH OBJ!!!!');
    res.send(authObj);
  })
  // .then( token => res.send(token))
  .catch( () => next(createError(401,'invalid login')));
});

authRouter.put('/api/newUserName', basicAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/newUserName');
  let password = req.auth.password;
  delete req.auth.password;
  User.findOne({username: req.auth.username})
  .then( user => user.comparePasswordHash(password))
  .then( user => User.findByIdAndUpdate(user._id, req.body, {new: true} ))
  .then( user => {
    if(!user){
      return next(createError(404, 'user not found'));
    }
    res.json(user);
  })
  .catch(next);
});

authRouter.delete('/api/remove/:id', basicAuth, function(req, res, next){
  debug('DELETE: /api/remove/:id');

  User.findByIdAndRemove(req.params.id)
  .then(Profile.findByIdAndRemove(req.params.id))
  .then( () => res.sendStatus(204))
  .catch(next);
});
