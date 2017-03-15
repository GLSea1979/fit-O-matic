'use strict';

const debug = require('debug')('fit-O-matic:profile-route');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');

// const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const profileRouter = module.exports = Router();

profileRouter.get('/api/profile/:id', bearerAuth ,function(req, res, next){
  debug('GET: /api/profile/:id');
  Profile.findOne({userID:req.params.id})
  .then( profile => {
    
    if(!profile) return next(createError(404, 'biffed it'));

    res.json(profile);
  })
  .catch(next);
});

profileRouter.put('/api/profile/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/profile/:id');
  if(!req.body) return next(createError(400, 'bad request'));
  Profile.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then( profile => {
    res.json(profile);
  })
  // .catch(next);
  .catch(err => {
    debug('here is our error:', err);
    next();
  });

});

profileRouter.delete('/api/profile/:id', bearerAuth, function(req, res, next){
  debug('DELETE: /api/profile/:id');
  Profile.findByIdAndRemove(req.params.id)
  .then( () => res.sendStatus(204))
  .catch(next);
});
