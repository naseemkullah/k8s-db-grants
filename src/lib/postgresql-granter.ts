import {Client} from 'pg';
import * as format from 'pg-format';
import {decryptK8sSecret} from './k8s-secret-decrypter';
import {SqlInstance} from './type';

export default async (instances: SqlInstance[]) => {
  for (const instance of instances) {
    const {username, password} = await decryptK8sSecret({
      secret: instance.k8sSecret,
      namespace: instance.k8sNamespace,
    });

    const client = new Client({
      host: instance.host || 'localhost',
      port: instance.port || 5432,
      user: username || 'postgres',
      database: 'postgres',
      password,
    });

    await client.connect();

    for (const grant of instance.grants) {
      const {username, password} = await decryptK8sSecret({
        secret: grant.k8sSecret,
        namespace: grant.k8sNamespace,
      });
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
      await client.query(roleCreationSql);
      await client.query(grantSql);
    }

    await client.end();
  }
};
