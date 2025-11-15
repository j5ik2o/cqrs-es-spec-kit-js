#!/usr/bin/env bash

set -eu

cd "$(dirname "$0")/../.." || exit 1

# Follow logs for all application services
docker-compose logs -f write-api-server read-model-updater read-api-server
