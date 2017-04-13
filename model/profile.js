'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profileSchema = Schema({
  name: {type: String},
  photoURI: {type: String},
  gender: {type: String},
  photoKey: {type: String},
  inseam: {type: Number},
  torso: {type: Number},
  height: {type: Number},
  userID: {type: Schema.Types.ObjectId, required: true},
  createdOn: {type: Date, default: Date.now},
  geoID: [{ type: Schema.Types.ObjectId, ref: 'geometry' }]
});

module.exports = mongoose.model('profile', profileSchema);
