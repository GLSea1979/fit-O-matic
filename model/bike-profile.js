'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bikeProfileSchema ={
  bikeName: { type: String, required: true },
  manufacturer: { type: String, required: true},
  category: { type: String, required: true},
  manufacturer-website: {type: String },
  price: { type: Number}
}

module.exports = mongoose.model('bikeProfile', bikeProfileSchema);
