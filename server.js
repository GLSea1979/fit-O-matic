'use strict';

const express = require('express');
const app = new express();
const debug = require('debug')('fit-O-matic:server');

const basic = require('./routes/basic-route.js');

const PORT = process.env.PORT || 8000;

app.use(basic);

app.listen(PORT, () => debug('server up:', PORT));