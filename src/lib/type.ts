export interface GrantsFile {
  mysql: SqlInstance[];
  postgresql: SqlInstance[];
}
export interface SqlInstance {
  host: string;
  port: number;
  k8sSecret: string;
  k8sNamespace: string;
  grants: Grant[];
}
export interface Grant {
  k8sSecret: string;
  k8sNamespace: string;
  db: string;
  host?: string;
}
