#!/usr/bin/env bash

set -eu

cd "$(dirname "$0")/../.." || exit 1

echo "Stopping all services..."
docker-compose down

echo "All services stopped!"
