'use strict';

const Router = require('express').Router;
const jsonParser =  require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('fit-O-matic:mfr-route');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Mfr = require('../model/mfr.js');

const mfrRouter = module.exports = Router();

mfrRouter.post('/api/mfr', bearerAuth, jsonParser, function(req, res, next){
  debug('POST: /api/mfr');
  if(!req.body.name) return next(createError(400, 'name required'));
  if(!req.body.website) return next(createError(400, 'website required'));

  return Mfr(req.body).save()
  .then( mfr => {
    res.json(mfr);
  })
  .catch(next);
});

mfrRouter.get('/api/mfr/:id', bearerAuth, function(req, res, next){
  debug('GET: /api/mfr/:id');

  if(!req.params.id) return next(createError(400, 'Mfr Id Required'));

  Mfr.findById(req.params.id)
  .then( mfr => {
    if(!mfr) return next(createError(400, 'User Not Found'));
    res.json(mfr);
  })
  .catch(next);

});
