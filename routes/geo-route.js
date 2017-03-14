'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('fit-O-matic:bike-geo-route');

const bikeAlgorithm = require('../lib/basic-fit-algorithm.js');
const bearerAuth = require('../lib/bearer-auth-middleware');
const BikeGeo = require('../model/geometry.js');
const Bike = require('../model/bike.js');

const bikeGeometryRouter = module.exports = Router();

bikeGeometryRouter.post('/api/bike/:bikeID/geometry', bearerAuth, jsonParser, (req, res, next) => {
  debug('POST: /api/bike/:bikeID/geometry');
  Bike.findById(req.params.bikeID)
  .then( bike => {
    if(!bike) return next(createError(404, 'bike not found'));
    req.body.bikeID = bike._id;
    BikeGeo(req.body).save();
  })
  .then( bike => {
    res.json(bike);
  })
  .catch(next);
});

bikeGeometryRouter.get('/api/geo/:height/:inseam', bearerAuth, function(req, res, next){
  debug('GET: /api/geo/:height/:inseam');
  if(!req.params.height) return next(createError(400, 'height required'));
  if(!req.params.inseam) return next(createError(400, 'inseam required'));

  let topTube = bikeAlgorithm.basicfit(req.params.height, req.params.inseam);
  debug('THE TOP TUBE----->', topTube);
  BikeGeo.find({topTubeLength: topTube})
  .then( geo => {
    debug('HERE IS THE GEO ------> ', geo);
    res.json();
  })
  .catch(next);
});
