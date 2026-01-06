#!/bin/bash
set -e

echo '🚀 CQRS/ES Spec Kit JS Development Environment'
echo ''
echo 'Installing dependencies...'
pnpm install
echo ''
echo 'Available tools:'
echo "  - Node.js: $(node --version)"
echo "  - pnpm: $(pnpm --version)"
echo "  - Docker: $(docker --version 2>/dev/null || echo 'available')"
echo ''
echo 'Quick start:'
echo '  pnpm build      # Build all packages'
echo '  pnpm test       # Run tests'
echo ''
