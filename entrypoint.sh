#!/bin/sh
set -e

# Generate certs if they don't exist
if [ ! -f /app/certs/key.pem ]; then
    echo "Generating self-signed certificates..."
    mkdir -p /app/certs
    openssl req -x509 -newkey rsa:4096 \
        -keyout /app/certs/key.pem \
        -out /app/certs/cert.pem \
        -days 365 -nodes \
        -subj "/CN=localhost"
    echo "Certificates generated."
fi

exec "$@"
