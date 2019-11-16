const dev = !['staging', 'production'].includes(process.env.NODE_ENV);

const logger = require('pino')({
  useLevelLabels: true,
  prettyPrint: dev,
  timestamp: dev ? {} : () => `,"eventTime":"${Date.now() / 1000.0}"`,
});

module.exports = { logger };
