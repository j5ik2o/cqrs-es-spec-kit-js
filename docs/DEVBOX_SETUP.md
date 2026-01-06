# Devbox Setup Guide

This guide explains how to set up the Devbox-based development environment for this repository.

## What is Devbox?

[Devbox](https://www.jetify.com/devbox) is a command-line tool that creates isolated, reproducible development environments. It uses Nix under the hood but provides a simpler interface - you don't need to learn Nix to use it.

## 1. Install Devbox

### macOS / Linux

```bash
curl -fsSL https://get.jetify.com/devbox | bash
```

### Windows (WSL2)

Run the same command inside your WSL2 environment:

```bash
curl -fsSL https://get.jetify.com/devbox | bash
```

For more installation options, see the [official documentation](https://www.jetify.com/devbox/docs/installing_devbox/).

## 2. (Optional) Install direnv for Auto-Activation

If you want the development environment to activate automatically when you enter the directory, see [direnv setup](DIRENV_SETUP.md).

## 3. Enter the Dev Environment

From the repository root:

### With direnv (recommended)

```bash
# First time only - allow direnv to run in this directory
direnv allow

# After this, the environment activates automatically when you cd into the directory
```

### Without direnv

```bash
# Manually enter the development shell
devbox shell
```

## 4. Install Dependencies

```bash
pnpm install
```

## What's Included

The development environment includes:

| Tool | Description |
|------|-------------|
| **Node.js 22** | JavaScript runtime (LTS) |
| **pnpm** | Fast package manager |
| **Docker** | Container runtime |
| **docker-compose** | Multi-container orchestration |
| **AWS CLI v2** | AWS command-line interface |
| **jq** | JSON processor |
| **curl** | HTTP client |

## Useful Commands

```bash
# Check devbox status
devbox info

# Update packages to latest versions
devbox update

# Run a command in the devbox environment (without entering shell)
devbox run pnpm install

# Use devbox scripts defined in devbox.json
devbox run install   # pnpm install
devbox run build     # pnpm build
devbox run test      # pnpm test
```

## Troubleshooting

### "direnv: error .envrc is blocked"

Run `direnv allow` to allow direnv to execute the `.envrc` file.

### Nix installation prompts

Devbox will automatically install Nix if it's not present. This is normal and expected.

### Slow first run

The first time you run `devbox shell` or `direnv allow`, it needs to download packages. Subsequent runs will be much faster due to caching.

## Uninstalling

To remove devbox from your system:

```bash
# Remove devbox
rm -rf ~/.local/bin/devbox

# Remove devbox cache (optional)
rm -rf ~/.cache/devbox

# Remove Nix (if you want to remove it too)
# See: https://nixos.org/manual/nix/stable/installation/uninstall.html
```

---

That's all you need to start working with the Devbox-based environment!
