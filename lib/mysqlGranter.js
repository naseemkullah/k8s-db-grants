/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const util = require('util');
const mysql = require('mysql');
const { logger } = require('./logger');
const k8sSecretDecrypter = require('./k8sSecretDecrypter');

async function createGrants(connection, grants) {
  const query = util.promisify(connection.query).bind(connection);

  try {
    connection.connect();
    for (const grant of grants) {
      const [username, password] = await k8sSecretDecrypter(grant.k8sSecret, grant.k8sNamespace);
      try {
        const sql = 'GRANT ALL PRIVILEGES ON ??.* TO ?@? identified by ?';
        const inserts = [grant.db, username, grant.host, password];
        const formattedSql = mysql.format(sql, inserts);
        await query(formattedSql);
      } catch (error) {
        logger.error(error);
      }
    }
    connection.end();
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
    const connection = mysql.createConnection({
      host: instance.host || 'localhost',
      port: instance.port || 3306,
      user: username || 'root',
      password: password || null,
    });
    await createGrants(connection, instance.grants);
  }
};
