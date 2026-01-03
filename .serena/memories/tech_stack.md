# 技術スタック

- 言語: TypeScript
- API: GraphQL（TypeGraphQL + Apollo Server）
- CQRS/ES: event-store-adapter-js を利用
- データストア: DynamoDB（ローカルは LocalStack）
- リードモデル永続化: Prisma + MySQL
- 開発環境: Nix（flake）、Docker/Docker Compose
- ビルド/タスク: Turborepo + pnpm
- Lint/Format: Biome

updated_at: 2025-12-30
