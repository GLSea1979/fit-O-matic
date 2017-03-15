'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('fit-O-matic:bike-route');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Bike = require('../model/bike.js');
const Mfr = require('../model/mfr.js');

const bikeRouter = module.exports = Router();

bikeRouter.post('/api/mfr/:mfrID/bike', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/mfr/:mfrID/bike');

  if(!req.body.bikeName) return next(createError(400, 'Need a bike name'));
  if(!req.body.photoURI) return next(createError(400, 'Need a photo URI'));
  if(!req.body.category) return next(createError(400, 'Need a category'));
  if(!req.params.mfrID) return next(createError(400, 'Need a mfr'));

  Mfr.findById(req.params.mfrID)
  .then( mfr => {
    if(!mfr) return next(createError(400, 'Mfr not found'));
    req.body.mfrID = mfr._id;
    return Bike(req.body).save()
    .then( bike => {
      res.json(bike);
    });
  })
  .catch(next);
});

bikeRouter.get('/api/bike/:bikeID', bearerAuth, function(req, res, next) {
  debug('GET /api/bike/:bikeID');

  if(!req.params.bikeID) return next(createError(400, 'need a bike ID'));

  Bike.findById(req.params.bikeID)
  .then( bike => {
    if(!bike) return next(createError(400, 'bike not found'));
    res.json(bike);
  })
  .catch(next);
});
