#!/bin/sh
set -e

echo "=== DecoERP Startup ==="
echo "Running database migrations..."

if /app/efbundle; then
    echo "Migrations applied successfully."
else
    echo "ERROR: Migration failed. Aborting startup."
    exit 1
fi

echo "Starting application..."
exec dotnet /app/DecoERP.Api.dll
