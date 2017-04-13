'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const vendorProfileSchema = Schema({
  name: {type: String, required: true},
  mfrID: {type: Schema.Types.ObjectId, ref: 'mfr'},
  position: {type: String, required: false}
});

module.exports = mongoose.model('vendor', vendorProfileSchema);
