
const isLocal = process.env.NODE_ENV === undefined;
const logger = require('pino')({
  useLevelLabels: true,
  prettyPrint: isLocal ? {} : false,
  timestamp: isLocal ? {} : () => `,"epochTime":"${Date.now() / 1000.0}"`,
});

module.exports = { logger };
