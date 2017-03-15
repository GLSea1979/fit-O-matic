'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mfrSchema = Schema({
  name: {type: String, required: true},
  website: {type: String, required: true}
});

module.exports = mongoose.model('mfr' , mfrSchema);