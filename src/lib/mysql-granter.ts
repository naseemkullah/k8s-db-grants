import * as mysql from 'mysql2/promise';
import {decryptK8sSecret} from './k8s-secret-decrypter';
import {SqlInstance} from './type';

export default async (instances: SqlInstance[]) => {
  for (const instance of instances) {
    const {username, password} = await decryptK8sSecret({
      secret: instance.k8sSecret,
      namespace: instance.k8sNamespace,
    });
    const connection = await mysql.createConnection({
      host: instance.host || 'localhost',
      port: instance.port || 3306,
      user: username || 'root',
      password,
    });
    for (const grant of instance.grants) {
      const {username, password} = await decryptK8sSecret({
        secret: grant.k8sSecret,
        namespace: grant.k8sNamespace,
      });

      await connection.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?;', [
        username,
        grant.host,
        password,
      ]);

      await connection.query('GRANT ALL ON ??.* TO ?@?;', [
        grant.db,
        username,
        grant.host,
      ]);
    }
    await connection.end();
  }
};
