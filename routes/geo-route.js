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
    if(!bike) return next(createError(400, 'invalid bike ID'));
    req.body.bikeID = bike._id;
    return BikeGeo(req.body).save()
    .then( geo => {
      res.json(geo);
    });
  })
  .catch(next);
});

bikeGeometryRouter.post('/api/geo', bearerAuth, jsonParser, (req, res, next) => {
  debug('POST: /api/geo');
  return BikeGeo(req.body).save()
  .then( geo => {
    res.json(geo);
  })
  .catch(next)
});
// TODO: test this

bikeGeometryRouter.get('/api/geo/:geoID', bearerAuth, function(req, res, next){
  debug('GET: /api/geo/:geoID');

  BikeGeo.findById(req.params.geoID)
  .then( geo => {
    if(!geo) return next(createError(400, 'invalid geometry ID'));
    res.json(geo);
  })
  .catch(next);
});

bikeGeometryRouter.get('/api/geos', bearerAuth, function(req, res, next){
  debug('GET: /api/geos');

  BikeGeo.find({})
  .then( geos => {
    res.json(geos);
  })
  .catch(next);
});
//todo: test!!!!


bikeGeometryRouter.get('/api/geo/', bearerAuth, function(req, res, next){
  debug('GET: /api/geo/?height=&inseam=&precision=');

  if(!req.query.height) return next(createError(400, 'height required'));
  if(!req.query.inseam) return next(createError(400, 'inseam required'));
  if(!req.query.precision) req.query.precision = 'std';

  var precisionRange = {
    std: 1.5,
    strict: 0,
    loose: 3
  };


  let geoQuery = {topTube: bikeAlgorithm.basicfit(req.query.height, req.query.inseam)};
  debug(geoQuery.topTube - precisionRange[req.query.precision], geoQuery.topTube + precisionRange[req.query.precision]);
  BikeGeo.find({topTubeLength: { $gte: geoQuery.topTube - precisionRange[req.query.precision], $lte: geoQuery.topTube + precisionRange[req.query.precision]}})
  //BikeGeo.find({topTubeLength: geoQuery.topTube})
  .populate('bikeID')
  .then( geo => {
    geoQuery.geo = geo;
    res.json(geoQuery);
  })
  .catch(next);
});
bikeGeometryRouter.put('/api/geo/:geoID', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/geo/:geoID');

  if(!req.params.geoID) return next(createError(400, 'Geometry ID Required'));

  BikeGeo.findByIdAndUpdate(req.params.geoID, req.body, {new:true})
  .then( geo => {
    if(!geo) return next(createError(404, 'Geometry Not Found'));
    res.json(geo);
  })
  .catch(next);
});
