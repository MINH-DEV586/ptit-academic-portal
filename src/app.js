const express = require('express');
const cors = require('cors');
const config = require('./config');
const requestLogger = require('./middlewares/requestLogger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { router, apiInfo } = require('./routes');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',') }));
  app.use(express.json({ limit: '100kb' }));
  if (config.logRequests) app.use(requestLogger);

  app.get('/', apiInfo);
  app.use('/api', router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };