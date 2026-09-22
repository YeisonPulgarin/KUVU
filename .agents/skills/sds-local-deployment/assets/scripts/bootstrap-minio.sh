#!/usr/bin/env sh
set -eu

mc alias set local "http://${MINIO_ENDPOINT:-minio:9000}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

mc mb "local/${MINIO_APP_SPACE}" --ignore-existing

mc admin policy create local app-policy /policies/app-policy.json || true

mc admin user add local "${MINIO_APP_USER}" "${MINIO_APP_PASSWORD}" || true

mc admin policy attach local app-policy --user "${MINIO_APP_USER}" || true

echo "MinIO bootstrap complete — bucket: ${MINIO_APP_SPACE}, user: ${MINIO_APP_USER}"
