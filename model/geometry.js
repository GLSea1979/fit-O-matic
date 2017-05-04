'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GeoSchema =  Schema({
  bikeID: [{type: Schema.Types.ObjectId, ref: 'bike'}],
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
  // TODO: plug this into routes etc
  mfrID: {type: Schema.Types.ObjectId, ref: 'mfr'}
});

module.exports = mongoose.model('geometry', GeoSchema);
