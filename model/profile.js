'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profileSchema = Schema({
  name: {type: String, required: true},
  gender: {type: String, required: false},
  photo: {type: String, required: false},
  inseam: {type: Number},
  torso: {type: Number},
  height: {type: Number},
  userID: {type: Schema.Types.ObjectId, required: true},
  createdOn: {type: Date, default: Date.now},
  // fitModelID: {type: Schema.Types.ObjectId, default: true},
  //TODO - UPDATE VALUE BELOW WITH PROPER SCHEMA NAME
  bikeGeo: [{ type: Schema.Types.ObjectId, ref: 'geo' }]
});

module.exports = mongoose.model('profile', profileSchema);
