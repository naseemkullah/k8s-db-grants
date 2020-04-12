import * as pino from 'pino';

const dev = !['staging', 'production'].includes(process.env.NODE_ENV || '');

export default pino({
  name: 'k8s-db-grants',
  prettyPrint: dev,
  timestamp: () => `,"eventTime":${Date.now() / 1000.0}`,
  level: process.env.LOG_LEVEL || 'info',
});
