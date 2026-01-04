# direnv インストール手順

OS に応じてインストールしてください。

## macOS（Homebrew）
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
# 旧環境:
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

## シェルのフック設定（必須）
インストール後、利用するシェルにフックを追加します。

### bash
`~/.bashrc` に追加:
```bash
eval "$(direnv hook bash)"
```

### zsh
`~/.zshrc` に追加:
```bash
eval "$(direnv hook zsh)"
```

### fish
`~/.config/fish/config.fish` に追加:
```fish
direnv hook fish | source
```

設定後、シェルを再起動してください。

---

## 動作確認
```bash
direnv version
```

以上で Nix 非依存の direnv 導入は完了です。
