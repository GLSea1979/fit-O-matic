'use strict';

const express = require('express');
const mongoose = require('mongoose');
const app = new express();
const debug = require('debug')('fit-O-matic:server');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.load();

const errors = require('./lib/error-middleware.js');
const authRouter = require('./routes/auth-route.js');
const bikeGeoRouter = require('./routes/bike-geo-route.js');
const basic = require('./routes/basic-route.js');

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(basic);
app.use(authRouter);
app.use(bikeGeoRouter);
app.use(errors);
app.listen(PORT, () => debug('server up:', PORT));
