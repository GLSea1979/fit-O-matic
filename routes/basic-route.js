const Router = require('express').Router;
const debug = require('debug')('fit-O-matic:basic-route');
//const createError = require('http-errors');

const basicRouter = module.exports = Router();

// basicRouter.get('/', (req, res, next) => {
//   debug('GET /');
//
//   res.send('Your app is working')
//   .end();
//   next();
// });

basicRouter.get('/', (req, res, next) => {
  debug('GET: /');

  res.send('./public/index.html')
  .end()
  next();
});
