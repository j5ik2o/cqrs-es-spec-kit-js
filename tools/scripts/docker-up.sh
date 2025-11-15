#!/usr/bin/env bash

set -eu

cd "$(dirname "$0")/../.." || exit 1

echo "Starting infrastructure services (databases, localstack)..."
docker-compose up -d mysql localstack dynamodb-setup dynamodb-admin phpmyadmin migration

echo "Waiting for services to be ready..."
sleep 10

echo "Starting application services..."
docker-compose up -d write-api-server read-model-updater read-api-server

echo "All services started!"
echo ""
echo "Services available at:"
echo "  - Write API:        http://localhost:38080"
echo "  - Read API:         http://localhost:38082"
echo "  - Read Model Updater: http://localhost:38081"
echo "  - DynamoDB Admin:   http://localhost:38003"
echo "  - phpMyAdmin:       http://localhost:24040"
echo ""
echo "Run 'docker-compose ps' to check service status"
echo "Run 'docker-compose logs -f' to view logs"
