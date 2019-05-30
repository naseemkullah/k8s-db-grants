const yaml = require('js-yaml');
const fs = require('fs');
const { logger } = require('./lib/logger');
const mysqlGranter = require('./lib/mysqlGranter');
const postgresqlGranter = require('./lib/postgresqlGranter');

try {
  const grantsFile = yaml.safeLoad(fs.readFileSync('grants.yml', 'utf8'));
  const { mysql: mysqlGrants, postgresql: postgresqlGrants } = grantsFile;

  if (!Array.isArray(mysqlGrants) || !mysqlGrants.length) {
    logger.info('No mysql privileges to grant');
  } else {
    mysqlGranter(mysqlGrants);
  }

  if (!Array.isArray(postgresqlGrants) || !postgresqlGrants.length) {
    logger.info('No postgresql privileges to grant');
  } else {
    postgresqlGranter(postgresqlGrants);
  }
} catch (error) {
  logger.error(error);
}
