'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bikeGeoSchema =  Schema({
  bikeProfileID: {type: Schema.Types.ObjectId, required: true},
  bikeSizeName: {type: String, required: true},
  wheelSize: {type: Number},
  bbDrop: {type: Number},
  forkLength: {type: Number},
  forkOffset: {type: Number},
  topTubeLength: {type: Number},
  headTubeLength: {type: Number},
  headTubeAngle: {type: Number},
  seatTubeAngle: {type: Number},
  stack: {type: Number},
  reach: {type: Number},
});

module.exports = mongoose.model('bikeGeometry', bikeGeoSchema);

