# Nix セットアップ手順

このガイドは、このリポジトリの Nix ベース開発環境を有効化するための手順です。

## 1. Nix をインストール
公式インストーラに従ってください:
- https://nix.dev/install-nix

## 2. Flakes を有効化
Nix の設定ファイルに以下を追加します。

### シングルユーザーインストール
`~/.config/nix/nix.conf`
```
experimental-features = nix-command flakes
```

### マルチユーザーインストール
`/etc/nix/nix.conf`
```
experimental-features = nix-command flakes
```

設定後、シェルを再起動してください。

## 3. 開発シェルに入る
リポジトリのルートで実行します:
```bash
nix develop
```

direnv を使う場合は次のコマンドでも構いません:
```bash
direnv allow
```

## 4. 依存関係をインストール
```bash
pnpm install
```

以上で、Nix ベースの開発環境が利用できます。
