const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '..', '.env'));
} catch {
}

const env = process.env.NODE_ENV || 'development';

module.exports = {
  env,
  isTest: env === 'test',
  port: Number(process.env.PORT) || 3001,
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'academic.db'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logRequests: process.env.LOG_REQUESTS
    ? process.env.LOG_REQUESTS === 'true'
    : env !== 'test',
};
