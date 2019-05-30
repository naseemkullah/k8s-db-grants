/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const { Client } = require('pg');
const format = require('pg-format');
const { logger } = require('./logger');
const k8sSecretDecrypter = require('./k8sSecretDecrypter');

async function createGrants(client, grants) {
  try {
    client.connect();
    for (const grant of grants) {
      const [username, password] = await k8sSecretDecrypter(grant.k8sSecret, grant.k8sNamespace);
      const roleCreationSql = format(`
      DO $$
      BEGIN
        CREATE ROLE %I WITH LOGIN PASSWORD %L;
        EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE %L;
      END
      $$;
      `, username, password, `not creating role ${username} -- it already exists`);
      const grantSql = format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', grant.db, username);
      try {
        await client.query(roleCreationSql);
        await client.query(grantSql);
      } catch (error) {
        logger.error(error);
      }
    }
    client.end();
  } catch (err) {
    logger.error(err);
  }
}

module.exports = async (instances) => {
  for (const instance of instances) {
    const [username, password] = await k8sSecretDecrypter(
      instance.k8sSecret,
      instance.k8sNamespace,
    );
    const client = new Client({
      host: instance.host || 'localhost',
      port: instance.port || 5432,
      user: username || 'postgres',
      database: 'postgres',
      password: password || null,
    });
    await createGrants(client, instance.grants);
  }
};
