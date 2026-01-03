# 推奨コマンド

## 環境
- `nix develop` 開発環境へ入る
- `pnpm install` 依存関係インストール

## Docker 開発環境
- `pnpm docker-build` Docker イメージ作成
- `pnpm docker-up` 主要サービス起動
- `pnpm docker-down` 停止
- `pnpm docker-logs` ログ表示（アプリ系）
- `docker-compose ps` 状態確認
- `docker-compose logs -f localstack` LocalStack ログ

## ビルド/品質
- `pnpm build`
- `pnpm lint`
- `pnpm lint:fix`
- `pnpm format`
- `pnpm format:fix`
- `pnpm clean`

## テスト
- `pnpm test`
- `pnpm verify-order`

updated_at: 2025-12-30
