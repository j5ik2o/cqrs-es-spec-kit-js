# Dev Container Setup Guide

This guide explains how to set up the Dev Container-based development environment for this repository.

## What is Dev Container?

[Dev Containers](https://containers.dev/) is an open specification for containerized development environments. It's supported by VS Code, GitHub Codespaces, JetBrains IDEs, and other tools.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine on Linux)
- One of the following:
  - [VS Code](https://code.visualstudio.com/) with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
  - [JetBrains IDE](https://www.jetbrains.com/remote-development/gateway/) with Gateway
  - [GitHub Codespaces](https://github.com/features/codespaces)

## Quick Start

### VS Code

1. Open the repository in VS Code
2. When prompted "Reopen in Container", click **Reopen in Container**
   - Or use Command Palette (`Cmd/Ctrl + Shift + P`) → `Dev Containers: Reopen in Container`
3. Wait for the container to build (first time takes a few minutes)
4. The environment is ready when you see the terminal output

### GitHub Codespaces

1. Click **Code** → **Codespaces** → **Create codespace on main**
2. Wait for the environment to be provisioned
3. Start developing in the browser or open in VS Code

### JetBrains Gateway

1. Open JetBrains Gateway
2. Select **Dev Containers** → **Create Dev Container**
3. Choose this repository
4. Wait for the container to build

## What's Included

The development environment includes:

| Tool | Description |
|------|-------------|
| **Node.js 22** | JavaScript runtime (LTS) |
| **pnpm** | Fast package manager |
| **Docker-in-Docker** | Container runtime inside container |
| **AWS CLI v2** | AWS command-line interface |
| **jq** | JSON processor |
| **curl** | HTTP client |

### VS Code Extensions (auto-installed)

- Biome (formatter/linter)
- ESLint
- GraphQL
- Prisma
- Docker

## Useful Commands

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Start development
pnpm dev
```

## Troubleshooting

### Container build fails

Try rebuilding the container:
- VS Code: Command Palette → `Dev Containers: Rebuild Container`
- Or delete the container and reopen

### Docker-in-Docker issues

If Docker commands don't work inside the container:
1. Check if Docker socket is mounted correctly
2. Restart the container
3. Verify Docker Desktop is running on host

### Slow performance on macOS/Windows

For better performance with large node_modules:
1. Use named volumes for node_modules (already configured)
2. Consider using [mutagen](https://mutagen.io/) for file sync

## Comparison with Devbox

| Feature | Dev Container | Devbox |
|---------|--------------|--------|
| Setup | Docker + Extension | Devbox CLI |
| Platform | Cross-platform via Docker | Linux/macOS/WSL2 |
| IDE Support | VS Code, JetBrains, Codespaces | Any terminal |
| Isolation | Full container | Nix-based |
| Portability | Dockerfile | Nix flake |

Choose Dev Container if:
- You prefer VS Code or JetBrains IDEs
- You want to use GitHub Codespaces
- Your team already uses Docker

Choose Devbox if:
- You prefer terminal-based workflows
- You don't want Docker overhead
- You need Nix-based reproducibility

---

That's all you need to start working with the Dev Container environment!
