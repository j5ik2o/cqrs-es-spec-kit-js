# Devbox セットアップ手順

このガイドは、このリポジトリの Devbox ベース開発環境をセットアップするための手順です。

## Devbox とは？

[Devbox](https://www.jetify.com/devbox) は、隔離された再現可能な開発環境を作成するコマンドラインツールです。内部的に Nix を使用していますが、よりシンプルなインターフェースを提供しており、Nix を学ぶ必要はありません。

## 1. Devbox をインストール

### macOS / Linux

```bash
curl -fsSL https://get.jetify.com/devbox | bash
```

### Windows (WSL2)

WSL2 環境内で同じコマンドを実行します：

```bash
curl -fsSL https://get.jetify.com/devbox | bash
```

その他のインストールオプションについては、[公式ドキュメント](https://www.jetify.com/devbox/docs/installing_devbox/)を参照してください。

## 2. (オプション) direnv をインストールして自動有効化

ディレクトリに入ったときに開発環境を自動的に有効化したい場合は、[direnv セットアップ](DIRENV_SETUP.ja.md)を参照してください。

## 3. 開発環境に入る

リポジトリのルートで実行します：

### direnv を使う場合（推奨）

```bash
# 初回のみ - このディレクトリで direnv の実行を許可
direnv allow

# 以降はディレクトリに cd すると自動的に環境が有効化されます
```

### direnv を使わない場合

```bash
# 手動で開発シェルに入る
devbox shell
```

## 4. 依存関係をインストール

```bash
pnpm install
```

## 含まれるツール

開発環境には以下が含まれています：

| ツール | 説明 |
|--------|------|
| **Node.js 22** | JavaScript ランタイム（LTS） |
| **pnpm** | 高速パッケージマネージャー |
| **Docker** | コンテナランタイム |
| **docker-compose** | マルチコンテナオーケストレーション |
| **AWS CLI v2** | AWS コマンドラインインターフェース |
| **jq** | JSON プロセッサー |
| **curl** | HTTP クライアント |

## 便利なコマンド

```bash
# devbox のステータスを確認
devbox info

# パッケージを最新版に更新
devbox update

# シェルに入らずに devbox 環境でコマンドを実行
devbox run pnpm install

# devbox.json で定義されたスクリプトを使用
devbox run install   # pnpm install
devbox run build     # pnpm build
devbox run test      # pnpm test
```

## トラブルシューティング

### "direnv: error .envrc is blocked"

`direnv allow` を実行して、direnv が `.envrc` ファイルを実行できるようにしてください。

### Nix インストールのプロンプト

Devbox は Nix がインストールされていない場合、自動的にインストールします。これは正常な動作です。

### 初回実行が遅い

最初に `devbox shell` または `direnv allow` を実行するときは、パッケージのダウンロードが必要です。キャッシュにより、2回目以降の実行は非常に高速になります。

## アンインストール

システムから devbox を削除するには：

```bash
# devbox を削除
rm -rf ~/.local/bin/devbox

# devbox キャッシュを削除（オプション）
rm -rf ~/.cache/devbox

# Nix も削除したい場合
# 参照: https://nixos.org/manual/nix/stable/installation/uninstall.html
```

---

以上で、Devbox ベースの開発環境が利用できます！
