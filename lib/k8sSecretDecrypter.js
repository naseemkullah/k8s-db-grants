const { Client } = require('kubernetes-client');
const Request = require('kubernetes-client/backends/request');

let client;
let backend;
try {
  backend = new Request(Request.config.getInCluster());
  client = new Client({ backend });
} catch (err) {
  backend = new Request(Request.config.fromKubeconfig());
  client = new Client({ backend, version: '1.13' });
}
const awaitClient = async () => client.loadSpec();
awaitClient();

module.exports = async (k8sSecret, k8sNamespace) => {
  const k8sSecretObject = await client.api.v1
    .namespaces(k8sNamespace)
    .secrets(k8sSecret).get();
  const { data } = k8sSecretObject.body;
  const username = Buffer.from(data.username, 'base64').toString();
  const password = Buffer.from(data.password, 'base64').toString();
  return [username, password];
};
