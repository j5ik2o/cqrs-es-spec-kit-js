# Nix Setup Guide

This guide explains how to enable the Nix-based development environment for this repository.

## 1. Install Nix
Follow the official installer for your OS:
- https://nix.dev/install-nix

## 2. Enable Flakes
Add the following to your Nix configuration:

### Single-user install
`~/.config/nix/nix.conf`
```
experimental-features = nix-command flakes
```

### Multi-user install
`/etc/nix/nix.conf`
```
experimental-features = nix-command flakes
```

Then restart your shell.

## 3. Enter the Dev Shell
From the repository root:
```bash
nix develop
```

If you use direnv, you can instead run:
```bash
direnv allow
```

## 4. Install Dependencies
```bash
pnpm install
```

That’s all you need to start working with the Nix-based environment.
