'use strict';

const debug = require('debug')('fit-O-matic:basic-fit-algorithm');

module.exports = exports = {};

exports.basicfit = function(height, inseam) {
  debug('basic fit algorithm');
  if (!height) return createError('400', 'need a height measurement');
  if (!inseam) return createError('400', 'need an inseam measurement');
  let size = (height * .657);
  if ( height/inseam > 2.2) {
    size += 2;
    return size;
  }
  if ( height/inseam < 2) {
    size -=2;
    return size;
  }
  return size;
}
