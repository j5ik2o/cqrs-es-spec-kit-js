# 技術スタック

## アーキテクチャ

DDD + CQRS/イベントソーシング + クリーンアーキテクチャを前提に、コマンド/クエリ分離とイベントストリーム経由のリードモデル更新を行う。

## コア技術

- **言語**: TypeScript
- **ランタイム**: Node.js 20+
- **API**: GraphQL（TypeGraphQL + Apollo Server）
- **ストレージ**: DynamoDB（イベントストア）、PostgreSQL（リードモデル）
- **ビルド/モノレポ**: pnpm workspaces + Turborepo

## 主要ライブラリ

- event-store-adapter-js（イベントストア基盤）
- fp-ts（関数型スタイルのエラー/タスク処理）
- Prisma（リードモデル永続化）
- AWS SDK（DynamoDB/DynamoDB Streams）

## 開発標準

### 型安全

- TypeScript を前提とし、ドメインは型（ID/値オブジェクト）で表現する

### コード品質

- Biome で lint/format を統一する（インデント 2、line width 120）

### テスト

- Jest を基本にパッケージ単位で実行する
- E2E は `pnpm verify-cart` で Cart ドメインを検証する

## 開発環境

### 必須ツール

- Node.js 20.5+ / pnpm 8+
- Docker（ローカル検証、E2E 連携）

### 共通コマンド

```bash
# build: pnpm build
# test: pnpm test
# lint: pnpm lint
# e2e: pnpm verify-cart
```

## 主要な技術的決定

- DynamoDB をイベントストアの中心に置き、DynamoDB Streams を RMU に流す
- GraphQL をコマンド/クエリ共通の入口とし、TypeGraphQL で型をコードから生成する
- モジュール分割（command/query/rmu/infrastructure/bootstrap）で責務を明確化する

---
updated_at: 2026-01-03
