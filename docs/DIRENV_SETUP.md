# direnv Installation Guide

Install the package for your OS.

## macOS (Homebrew)
```bash
brew update
brew install direnv
```

## Ubuntu / Debian
```bash
sudo apt update
sudo apt install -y direnv
```

## Fedora / RHEL / CentOS
```bash
sudo dnf install -y direnv
# Older environments:
# sudo yum install -y direnv
```

## Arch Linux
```bash
sudo pacman -S direnv
```

## Alpine
```bash
sudo apk add direnv
```

## openSUSE
```bash
sudo zypper install direnv
```

## Windows
### Scoop
```powershell
scoop install direnv
```

### Chocolatey
```powershell
choco install direnv
```

### winget
```powershell
winget install direnv
```

---

## Shell Hook Setup (Required)
After installation, add the hook to your shell configuration.

### bash
Add to `~/.bashrc`:
```bash
eval "$(direnv hook bash)"
```

### zsh
Add to `~/.zshrc`:
```bash
eval "$(direnv hook zsh)"
```

### fish
Add to `~/.config/fish/config.fish`:
```fish
direnv hook fish | source
```

Restart your shell after updating the configuration.

---

## Verification
```bash
direnv version
```

That’s all you need to start using direnv without Nix.
