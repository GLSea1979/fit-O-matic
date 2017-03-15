'use strict';

const debug = require('debug')('fit-O-matic:basic-fit-algorithm');
const createError = require('http-errors');

module.exports = exports = {};

exports.basicfit = function(height, inseam) {
  debug('basic fit algorithm');
  if (!height) return createError('400', 'need a height measurement');
  if (!inseam) return createError('400', 'need an inseam measurement');
  let size = (inseam * .657);
  if ( height/inseam > 2.2) {
    size += 2;
    return Math.floor(size);
  }
  if ( height/inseam < 2) {
    size -= 2;
    return Math.floor(size);
  }
  return Math.floor(size);
};
