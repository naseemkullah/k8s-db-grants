import * as pino from 'pino';

export const logger = pino({
  name: 'k8s-db-grants',
  prettyPrint: true,
});
