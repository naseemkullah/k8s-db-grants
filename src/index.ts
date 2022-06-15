import Ajv from 'ajv';
import {promises as fs} from 'fs';
import * as yaml from 'js-yaml';
import {exit} from 'process';
import {logger} from './lib/logger';
import mysqlGranter from './lib/mysql-granter';
import postgresqlGranter from './lib/postgresql-granter';
import * as schema from './lib/schema.json';
import {GrantsFile} from './lib/type';

(async () => {
  const grantsFilePath = process.argv[2] ?? 'grants.yaml';
  const grants = yaml.load(
    await fs.readFile(grantsFilePath, 'utf8')
  ) as GrantsFile;
  const ajv = new Ajv({logger});

  const validate = ajv.compile(schema);

  const valid = validate(grants);

  if (!valid) {
    const validationError = new Error('Invalid grants file');
    (validationError as Error & {errors: typeof validate.errors}).errors =
      validate.errors;
    throw validationError;
  }

  const {mysql: mysqlGrants, postgresql: postgresqlGrants} = grants;

  if (mysqlGrants?.length > 0) {
    await mysqlGranter(mysqlGrants);
  }

  if (postgresqlGrants?.length > 0) {
    await postgresqlGranter(postgresqlGrants);
  }
})().catch(err => {
  logger.fatal({err});
  exit(1);
});
