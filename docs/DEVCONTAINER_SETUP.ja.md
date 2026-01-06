# Dev Container セットアップ手順

このガイドは、このリポジトリの Dev Container ベース開発環境をセットアップするための手順です。

## Dev Container とは？

[Dev Containers](https://containers.dev/) は、コンテナ化された開発環境のオープン仕様です。VS Code、GitHub Codespaces、JetBrains IDE などのツールでサポートされています。

## 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)（または Linux の場合は Docker Engine）
- 以下のいずれか：
  - [VS Code](https://code.visualstudio.com/) と [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
  - [JetBrains IDE](https://www.jetbrains.com/remote-development/gateway/) と Gateway
  - [GitHub Codespaces](https://github.com/features/codespaces)

## クイックスタート

### VS Code

1. VS Code でリポジトリを開く
2. 「Reopen in Container」のプロンプトが表示されたら **Reopen in Container** をクリック
   - または Command Palette（`Cmd/Ctrl + Shift + P`）→ `Dev Containers: Reopen in Container`
3. コンテナのビルドを待つ（初回は数分かかります）
4. ターミナル出力が表示されたら環境の準備完了

### GitHub Codespaces

1. **Code** → **Codespaces** → **Create codespace on main** をクリック
2. 環境のプロビジョニングを待つ
3. ブラウザで開発を開始、または VS Code で開く

### JetBrains Gateway

1. JetBrains Gateway を開く
2. **Dev Containers** → **Create Dev Container** を選択
3. このリポジトリを選択
4. コンテナのビルドを待つ

## 含まれるツール

開発環境には以下が含まれています：

| ツール | 説明 |
|--------|------|
| **Node.js 22** | JavaScript ランタイム（LTS） |
| **pnpm** | 高速パッケージマネージャー |
| **Docker-in-Docker** | コンテナ内でのコンテナランタイム |
| **AWS CLI v2** | AWS コマンドラインインターフェース |
| **jq** | JSON プロセッサー |
| **curl** | HTTP クライアント |

### VS Code 拡張機能（自動インストール）

- Biome（フォーマッター/リンター）
- ESLint
- GraphQL
- Prisma
- Docker

## 便利なコマンド

```bash
# すべてのパッケージをビルド
pnpm build

# テストを実行
pnpm test

# 開発を開始
pnpm dev
```

## トラブルシューティング

### コンテナのビルドが失敗する

コンテナを再ビルドしてください：
- VS Code: Command Palette → `Dev Containers: Rebuild Container`
- またはコンテナを削除して再度開く

### Docker-in-Docker の問題

コンテナ内で Docker コマンドが動作しない場合：
1. Docker ソケットが正しくマウントされているか確認
2. コンテナを再起動
3. ホストで Docker Desktop が実行中か確認

### macOS/Windows でのパフォーマンス低下

大きな node_modules でパフォーマンスを向上させるには：
1. node_modules に名前付きボリュームを使用（設定済み）
2. ファイル同期に [mutagen](https://mutagen.io/) の使用を検討

## Devbox との比較

| 機能 | Dev Container | Devbox |
|------|--------------|--------|
| セットアップ | Docker + 拡張機能 | Devbox CLI |
| プラットフォーム | Docker 経由でクロスプラットフォーム | Linux/macOS/WSL2 |
| IDE サポート | VS Code, JetBrains, Codespaces | 任意のターミナル |
| 分離 | フルコンテナ | Nix ベース |
| 移植性 | Dockerfile | Nix flake |

Dev Container を選ぶ場合：
- VS Code や JetBrains IDE を好む場合
- GitHub Codespaces を使いたい場合
- チームがすでに Docker を使用している場合

Devbox を選ぶ場合：
- ターミナルベースのワークフローを好む場合
- Docker のオーバーヘッドを避けたい場合
- Nix ベースの再現性が必要な場合

---

以上で、Dev Container ベースの開発環境が利用できます！
