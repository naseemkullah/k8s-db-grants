/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const { Client } = require('pg');
const { logger } = require('./logger');
const k8sSecretDecrypter = require('./k8sSecretDecrypter');

async function createGrants(client, grants) {
  try {
    client.connect();
    for (const grant of grants) {
      const [username, password] = await k8sSecretDecrypter(grant.k8sSecret, grant.k8sNamespace);
      try {
        const roleCreationResult = await client.query(`
        DO $$
        BEGIN
          CREATE ROLE ${username} WITH LOGIN PASSWORD '${password}';
          EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'not creating role ${username} -- it already exists';
        END
        $$;
        `);
        logger.info(roleCreationResult);
        const grantResult = await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${grant.db} TO ${username}`);
        logger.info(grantResult);
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
