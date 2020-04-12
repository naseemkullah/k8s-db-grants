/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import {Client} from 'pg';
import * as format from 'pg-format';
import {logger} from './logger';
import k8sSecretDecrypter from './k8s-secret-decrypter';

async function createGrants(client: Client, grants: any) {
  client.connect().catch(e => logger.error(e));
  for (const grant of grants) {
    const [username, password] = await k8sSecretDecrypter(
      grant.k8sSecret,
      grant.k8sNamespace
    );
    const roleCreationSql = format(
      `
      DO $$
      BEGIN
        CREATE ROLE %I WITH LOGIN PASSWORD %L;
        EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE %L;
      END
      $$;
      `,
      username,
      password,
      `not creating role ${username} -- it already exists`
    );
    const grantSql = format(
      'GRANT ALL PRIVILEGES ON DATABASE %I TO %I',
      grant.db,
      username
    );
    try {
      await client.query(roleCreationSql);
      await client.query(grantSql);
    } catch (err) {
      logger.error(err);
    } finally {
      client.end().catch(err => logger.error(err));
    }
  }
}

export default async (instances: any) => {
  for (const instance of instances) {
    const [username, password] = await k8sSecretDecrypter(
      instance.k8sSecret,
      instance.k8sNamespace
    );
    const client = new Client({
      host: instance.host || 'localhost',
      port: instance.port || 5432,
      user: username || 'postgres',
      database: 'postgres',
      password,
    });
    try {
      await createGrants(client, instance.grants);
    } catch (error) {
      logger.error({error}, error);
    }
  }
};
