#!/usr/bin/env bash

set -eu

cd "$(dirname "$0")/../.." || exit 1

echo "Starting all services..."
docker-compose up -d

echo "All services started!"
echo ""
echo "Services available at:"
echo "  - Write API:        http://localhost:38080"
echo "  - Read API:         http://localhost:38082"
echo "  - Lambda RMU:       (runs as LocalStack Lambda)"
echo "  - DynamoDB Admin:   http://localhost:38003"
echo "  - phpMyAdmin:       http://localhost:24040"
echo ""
echo "Run 'docker-compose ps' to check service status"
echo "Run 'docker-compose logs -f' to view logs"
