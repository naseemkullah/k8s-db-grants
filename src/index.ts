import * as yaml from 'js-yaml';
import * as fs from 'fs';
import logger from './lib/logger';
import mysqlGranter from './lib/mysql-granter';
import postgresqlGranter from './lib/postgresql-granter';

const grantsFile = yaml.safeLoad(fs.readFileSync('grants.yaml', 'utf8'));
const {mysql: mysqlGrants, postgresql: postgresqlGrants} = grantsFile;

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
