#!/usr/bin/env bash

set -eu

cd "$(dirname "$0")/../.." || exit 1

echo "Building Docker image..."
docker build -t cqrs-es-spec-kit-js:latest .

echo "Docker image built successfully!"
docker images | grep cqrs-es-spec-kit-js
