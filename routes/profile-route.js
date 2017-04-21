'use strict';

const debug = require('debug')('fit-O-matic:profile-route');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const createError = require('http-errors');

const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const fs = require('fs');
const path = require('path');
const del = require('del');
const multer = require('multer');
const s3methods = require('../lib/s3-methods.js');
const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir });

const profileRouter = module.exports = Router();


profileRouter.post('/api/profile/:userid', bearerAuth, jsonParser,  function(req, res, next){
  debug('POST: /api/profile/:userid');
  req.body.userID = req.params.userid;
  new Profile(req.body).save()
  .then( profile => {
    return res.json(profile);
  })
  .catch(next);
});//end POST

profileRouter.get('/api/profile/:id/bikes', bearerAuth ,function(req, res, next){
  debug('GET: /api/profile/:id');
  Profile.findOne({userID:req.params.id})
  .populate('geoID')
  .then( profile => {
    if(!profile) return next(createError(404, 'nailed it dork'));
    debug('whole shibang', profile);
    res.json(profile);
  })
  .catch(next);
});

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
  if(Object.keys(req.body).length === 0) return next(createError(400, 'bad request'));

  Profile.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then( profile => {
    res.json(profile);
  })
  .catch(next);
});

profileRouter.put('/api/favorites/profile/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/favorites/profile/:id');
  if(Object.keys(req.body).length === 0) return next(createError(400, 'bad request'));

  Profile.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .populate('geoID')
  .exec(function(err, docs) {
    if(err) return next(err);
    Profile.populate(docs, {
      path: 'geoID.bikeID',
      model: 'bike'
    },
    function(err, bikes) {
      if(err) return next(err);
      res.json(bikes);
    });
  });
});

profileRouter.get('/api/favorites/profile/:id', bearerAuth ,function(req, res, next){
  debug('GET: /api/profile/:id');
  Profile.findOne({userID:req.params.id})
  .populate('geoID')
  .exec(function(err, docs) {
    if(err) return next(err);
    Profile.populate(docs, {
      path: 'geoID.bikeID',
      model: 'bike'
    },
    function(err, bikes) {
      if(err) return next(err);
      res.json(bikes);
    });
  });
});

profileRouter.put('/api/profile/photo/:id', bearerAuth, upload.single('image'),  jsonParser, function(req, res, next){
  debug('PUT: /api/profile/photo/:id');
  if(!req.file) return next(createError(400, 'photo required'));
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
    Profile.findByIdAndUpdate(req.params.id, req.body, {new: true})
    .then( profile => {
      res.json(profile);
    });
  })
  .catch(next);
});

profileRouter.delete('/api/profile/:id', bearerAuth, function(req, res, next){
  debug('DELETE: /api/profile/:id');
  Profile.findByIdAndRemove(req.params.id)
  .then( () => res.sendStatus(204))
  .catch(next);
});
