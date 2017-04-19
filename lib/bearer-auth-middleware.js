'use strict';

const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const debug = require('debug')('fit-O-matic:bearer-auth-middleware');

const User = require('../model/user.js');

module.exports = function(req, res, next) {
  debug('inside the bearer auth');

  var authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError(401, 'authorization header is required'));
  }

  var token = authHeader.split('Bearer ')[1];
  if (!token) {
    return next(createError(401, 'token is required'));
  }

  jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
    if (err) return next(err);
    User.findOne({ findHash: decoded.token })
    .then( user => {

      req.user = user;
      next();
    })
    .catch(err => {
      next(createError(401, err.message));
    });
  });
};
