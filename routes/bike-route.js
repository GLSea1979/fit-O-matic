'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('fit-O-matic:bike-route');

const fs = require('fs');
const path = require('path');
const del = require('del');
const multer = require('multer');
const s3methods = require('../lib/s3-methods.js');
const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir });

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Bike = require('../model/bike.js');
const Mfr = require('../model/mfr.js');

const bikeRouter = module.exports = Router();

bikeRouter.post('/api/mfr/:mfrID/bike', bearerAuth, upload.single('image'), jsonParser, function(req, res, next) {
  debug('POST: /api/mfr/:mfrID/bike');

  if(!req.body.bikeName) return next(createError(400, 'Need a bike name'));
  if(!req.body.category) return next(createError(400, 'Need a category'));
  if(!req.file) return next(createError(400, 'Need a photo'));
  if(!req.file.path) return next(createError(500, 'file not saved'));
  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };
  s3methods.uploadObjectProm(params)
  .then( s3data => {
    del([`${dataDir}/*`]);
    req.body.photoKey = s3data.Key;
    req.body.photoURI = s3data.Location;
    Mfr.findById(req.params.mfrID)
    .then( mfr => {
      if(!mfr) return next(createError(400, 'Mfr not found'));
      req.body.mfrID = mfr._id;
      debug('got here', req.body);
      return Bike(req.body).save()
      .then( bike => {
        res.json(bike);
      });
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

bikeRouter.get('/api/bikes/:mfrID', bearerAuth, function(req, res, next) {
  debug('GET /api/bikes/:mfrID');

  Bike.find({mfrID: req.params.mfrID})
  .then( bikes => {
    if(!bikes) return next(createError(400, 'no bikes'));
    res.json(bikes);
  })
  .catch(next);
});
//TODO Write some tests


bikeRouter.get('/api/bikes', bearerAuth, function(req, res, next) {
  debug('GET /api/bikes');

  Bike.find()
  .then( bikes => {
    if(!bikes[0]) return res.sendStatus(204);
    res.json(bikes);
  })
  .catch(next);
});