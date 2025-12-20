#!/bin/sh
set -e

: "${PORT:=8080}"
: "${BACKEND_PORT:=5000}"

envsubst '${PORT} ${BACKEND_PORT}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
