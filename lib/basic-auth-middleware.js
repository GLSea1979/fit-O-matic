'use strict';

const createError = require('http-errors');
const debug = require('debug')('fit-O-matic:basic-auth-middleware');

module.exports = function(req, res, next) {
  debug('auth');

  var authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError(401, 'authorization header required'));
  };

  var base64str = authHeader.split('Basic ')[1];
  if (!base64str) {
    return next(createError(401, 'username and password required'));
  };

  var utf8str = new Buffer(base64str, 'base64').toString();
  var authArr = utf8str.split(':');

  req.auth = {
    username: authArr[0],
    password: authArr[1]
  };

  if (!req.auth.username) {
    return next(createError(401, 'username required'));
  };

  if (!req.auth.password) {
    return next(createError(401, 'password required'));
  };

  next();
};
