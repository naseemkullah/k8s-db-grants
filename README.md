# k8s-db-grants

Create users/grants on dbs using pre-existing k8s secrets for user credentials.

Rename `grants-example.yaml` to `grants.yaml` and populate accordingly, or pass
the file name as a single argument to the script. K8s secrets should pre-exist
and contain `username` and `password` keys.

Admin users to perform grants should pre-exist but users on which privileges are
granted need not pre-exist.
