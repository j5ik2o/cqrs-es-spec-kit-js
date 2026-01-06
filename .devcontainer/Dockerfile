FROM mcr.microsoft.com/devcontainers/javascript-node:22

RUN apt-get update && apt-get install -y \
    jq \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@latest --activate

USER node
