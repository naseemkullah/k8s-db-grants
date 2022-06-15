import * as ApiClient from 'kubernetes-client';

const Client = ApiClient.Client1_13;
const client = new Client({});

export async function decryptK8sSecret({
  secret,
  namespace,
}: {
  secret: string;
  namespace: string;
}) {
  const {data} = (
    await client.api.v1.namespaces(namespace).secrets(secret).get()
  ).body;
  const username = Buffer.from(data.username, 'base64').toString();
  const password = Buffer.from(data.password, 'base64').toString();
  return {username, password};
}
