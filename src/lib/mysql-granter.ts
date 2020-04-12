/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import * as util from 'util';
import * as mysql from 'mysql';
import logger from './logger';
import k8sSecretDecrypter from './k8s-secret-decrypter';

async function createGrants(connection: mysql.Connection, grants: any) {
  const query = util.promisify(connection.query).bind(connection);

  connection.connect();
  for (const grant of grants) {
    const [username, password] = await k8sSecretDecrypter(
      grant.k8sSecret,
      grant.k8sNamespace
    );
    try {
      const sql = 'GRANT ALL PRIVILEGES ON ??.* TO ?@? identified by ?';
      const inserts = [grant.db, username, grant.host, password];
      const formattedSql = mysql.format(sql, inserts);
      await query(formattedSql);
    } catch (error) {
      logger.error({error}, error);
    }
  }
  connection.end();
}

export default async (instances: any) => {
  for (const instance of instances) {
    const [username, password] = await k8sSecretDecrypter(
      instance.k8sSecret,
      instance.k8sNamespace
    );
    const connection = mysql.createConnection({
      host: instance.host || 'localhost',
      port: instance.port || 3306,
      user: username || 'root',
      password,
    });
    try {
      await createGrants(connection, instance.grants);
    } catch (error) {
      logger.error({error}, error);
    }
  }
};
