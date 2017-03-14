'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('fit-O-matic:bike-geo-route');

const bearerAuth = require('../lib/bearer-auth-middleware');
const BikeGeo = require('../model/geometry.js');
const Bike = require('../model/bike.js');

const bikeGeometryRouter = module.exports = Router();

bikeGeometryRouter.post('/api/bike/:bikeID/geometry', bearerAuth, jsonParser, (req, res, next) => {
  debug('POST: /api/bike/:bikeID/geometry');
  Bike.findById(req.params.bikeID)
  .then( bike => {
    if(!bike) return next(createError(404, 'bike not found'));
    req.body.bikeProfileID = bike._id;
    console.log(bike);
    BikeGeo(req.body).save();
  })
  .then( bike => {
    res.json(bike);
  })
  .catch(next);
});
