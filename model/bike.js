'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BikeSchema = Schema({
  bikeName: { type: String, required: true },
  mfrID: { type: Schema.Types.ObjectId, required: true, ref: 'mfr'},
  category: { type: String, required: true},
  photoURI: { type: String, required: true},
  photoKey: { type: String, required: false},
  url: { type: String },
  price: { type: Number},
  modelYear: { type: String},
  created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('bike', BikeSchema);
