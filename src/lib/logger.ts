import pino from 'pino';

export const logger = pino({
  name: 'k8s-db-grants',
  customLevels: {
    log: 30,
  },
  transport: {
    target: 'pino-pretty',
    options: {translateTime: true},
  },
});
