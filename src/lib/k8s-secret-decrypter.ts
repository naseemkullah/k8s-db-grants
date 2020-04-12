import * as ApiClient from 'kubernetes-client';

const Client = ApiClient.Client1_13;
const client = new Client({version: '1.13'});

export default async (k8sSecret: string, k8sNamespace: string) => {
  const k8sSecretObject = await client.api.v1
    .namespaces(k8sNamespace)
    .secrets(k8sSecret)
    .get();
  const {data} = k8sSecretObject.body;
  const username = Buffer.from(data.username, 'base64').toString();
  const password = Buffer.from(data.password, 'base64').toString();
  return [username, password];
};
