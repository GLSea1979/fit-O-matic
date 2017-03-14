'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bikeProfileSchema = Schema({
  bikeName: { type: String, required: true },
  manufacturer: { type: String, required: true},
  category: { type: String, required: true},
  manufacturerWebsite: {type: String },
  price: { type: Number}
});

module.exports = mongoose.model('bikeProfile', bikeProfileSchema);
