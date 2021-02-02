import * as yaml from 'js-yaml';
import {promises as fs} from 'fs';
import {logger} from './lib/logger';
import mysqlGranter from './lib/mysql-granter';
import postgresqlGranter from './lib/postgresql-granter';

(async () => {
  const grantsFile = yaml.load(await fs.readFile('grants.yaml', 'utf8'));

  if (!grantsFile || typeof grantsFile !== 'object') {
    throw new Error('Invalid file.');
  }

  const {mysql: mysqlGrants, postgresql: postgresqlGrants} = grantsFile as any;

  if (!Array.isArray(mysqlGrants) || !mysqlGrants.length) {
    logger.info('No mysql privileges to grant');
  } else {
    await mysqlGranter(mysqlGrants);
  }

  if (!Array.isArray(postgresqlGrants) || !postgresqlGrants.length) {
    logger.info('No postgresql privileges to grant');
  } else {
    await postgresqlGranter(postgresqlGrants);
  }
})().catch(err => logger.error(err));
