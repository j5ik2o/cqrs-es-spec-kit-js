# cqrs-es-spec-kit-js

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**DDD と GraphQL による CQRS/イベントソーシングのための AI 駆動仕様キット**

ドメイン駆動設計（DDD）、CQRS/イベントソーシングパターン、GraphQL を組み合わせた、AI 支援による仕様駆動開発ワークフローを備えた総合的なテンプレートリポジトリです。

[English](./README.md)

---

## 概要

`cqrs-es-spec-kit-js` は、以下の技術を使用したスケーラブルなイベントソースシステムを構築するための本番環境対応の基盤を提供します：

- **ドメイン駆動設計（DDD）**: 集約モデリングと境界づけられたコンテキストのための戦術的パターン
- **CQRS/イベントソーシング**: 書き込みモデルと読み取りモデルの完全分離によるイベント駆動アーキテクチャ
- **GraphQL**: コマンド（ミューテーション）とクエリの両方に対応した型安全な API レイヤー
- **AI 駆動仕様**: AI ツール（Claude Code、Gemini、Codex）を活用した Kiro スタイルの体系的な機能開発ワークフロー

このテンプレートは、**DDD/CQRS/ES の基礎を理解している開発者** で、実績のある実装パターンと AI 支援開発ワークフローを求めている方を対象としています。

Event Storming によるドメイン分析で得られたドメインイベント、コマンド、集約、クエリモデルを、CQRS/Event Sourcing アーキテクチャによって素直に技術実装に落とし込める基盤を提供します。従来の CRUD ベースの実装では難しかった、分析結果と実装の一貫性を保つことができます。

---

## 特徴

### コアアーキテクチャ
- ✅ **イベントストア基盤**: DynamoDB バックエンドを持つ [event-store-adapter-js](https://github.com/j5ik2o/event-store-adapter-js) 上に構築
- ✅ **CQRS 実装**: GraphQL API による書き込みモデルと読み取りモデルの分離
- ✅ **リードモデルアップデーター**: クエリ側最適化のためのイベント駆動プロジェクションビルダー
- ✅ **参照実装**: [cqrs-es-example-js](https://github.com/j5ik2o/cqrs-es-example-js) からの本番グレードの実装例

### AI 駆動開発
- ✅ **Kiro ワークフロー**: 仕様 → 設計 → 実装の構造化されたフェーズ
- ✅ **マルチ AI サポート**: Claude Code、Gemini、Codex に対応
- ✅ **プロジェクトメモリ**: `.kiro/steering/` による永続的なアーキテクチャ決定の管理
- ✅ **仕様駆動**: `.kiro/specs/` による機能レベルの開発追跡

### 開発ツール
- ✅ **Docker Compose**: 完全なローカル開発環境
- ✅ **型安全性**: 完全な TypeScript 実装
- ✅ **GraphQL ツール**: TypeGraphQL デコレーターによる Apollo Server
- ✅ **ORM 統合**: リードモデル永続化のための Prisma

---

## クイックスタート

### 前提条件

- Node.js 18+ (LTS 推奨)
- Docker & Docker Compose (ローカルインフラ用)
- AI コーディングツール: Claude Code、Gemini、または Codex
- DDD、CQRS/ES、GraphQL の基本的な理解

### インストール

1. **このテンプレートを使用**:
   ```bash
   # GitHub で "Use this template" をクリック、または直接クローン:
   git clone --recursive https://github.com/j5ik2o/cqrs-es-spec-kit-js.git
   cd cqrs-es-spec-kit-js
   ```

2. **サブモジュールの初期化** (参照実装):
   ```bash
   git submodule update --init --recursive
   ```

3. **依存関係のインストール**:
   ```bash
   npm install

   # プロジェクトに event-store-adapter-js を追加
   npm install event-store-adapter-js
   ```

4. **参照実装の確認** (AI コード読み取り用):
   ```bash
   # references/ ディレクトリには AI ツールが参照するためのサンプルコードが含まれています
   # これらは実行時の依存関係としては使用されません

   # 完全な動作例を確認
   cd references/cqrs-es-example-js

   # イベントストアアダプターの実装パターンを確認
   cd references/event-store-adapter-js
   ```

---

## 利用可能な pnpm スクリプト

プロジェクトでは、一般的な開発タスクのための便利な pnpm スクリプトを提供しています：

### Docker 開発環境
```bash
pnpm docker-build     # Docker イメージをビルド
pnpm docker-up        # 全サービスを起動
pnpm docker-down      # 全サービスを停止
pnpm docker-logs      # サービスログを表示
```

### AI 開発ツール
```bash
pnpm claude           # Claude Code を起動
pnpm gemini           # Gemini を起動
pnpm codex            # Codex を起動
```

### テスト
```bash
pnpm verify-order     # Order ドメインの E2E テストを実行
pnpm test             # ユニットテストを実行
```

### ビルド・品質
```bash
pnpm build            # 全パッケージをビルド
pnpm lint             # Lint を実行
pnpm lint:fix         # Lint の問題を自動修正
pnpm format           # コードフォーマットをチェック
pnpm format:fix       # コードを自動フォーマット
pnpm clean            # ビルド成果物を削除
```

### データベース
```bash
pnpm prisma:generate  # Prisma Client を生成
```

---

## アーキテクチャ

### システムコンポーネント

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Write API      │      │ Read Model      │      │  Read API       │
│  (GraphQL)      │      │ Updater (RMU)   │      │  (GraphQL)      │
│                 │      │                 │      │                 │
│  Mutations      │─────▶│  Event Stream   │─────▶│  Queries        │
│  + Aggregates   │      │  Processing     │      │  + Projections  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
  ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
  │  Event      │         │  Event      │        │  Read Model │
  │  Store      │────────▶│  Stream     │        │  Database   │
  │ (DynamoDB)  │         │ (DynamoDB)  │        │ (PostgreSQL)│
  └─────────────┘         └─────────────┘        └─────────────┘
```

### レイヤー構造

クリーンアーキテクチャと DDD 戦術パターンに基づいています：

```
packages/
├── command/                      # 書き込み側 (CQRS)
│   ├── domain/                  # 純粋なドメインロジック
│   │   ├── aggregates/          # 集約ルート
│   │   ├── entities/            # ドメインエンティティ
│   │   ├── value-objects/       # 不変な値オブジェクト
│   │   └── events/              # ドメインイベント
│   ├── interface-adaptor-if/    # ポート定義
│   ├── interface-adaptor-impl/  # アダプター実装
│   └── processor/               # アプリケーションサービス
│
├── query/                        # 読み取り側 (CQRS)
│   ├── interface-adaptor/       # GraphQL リゾルバー
│   └── domain/                  # リードモデル DTO
│
├── rmu/                          # リードモデルアップデーター
│   ├── processors/              # イベントハンドラー
│   └── projections/             # リードモデルビルダー
│
└── infrastructure/               # 共有インフラストラクチャ
    ├── event-store/             # イベント永続化
    └── database/                # リードモデルストレージ
```

---

## 実装パターン

### 1. イベントソース化された集約

**ドメインレイヤー** (`packages/command/domain/`):

```typescript
// user-account.ts
export class UserAccount {
  private constructor(
    public readonly id: UserAccountId,
    public readonly name: string,
    public readonly sequenceNumber: number,
    public readonly version: number
  ) {}

  // ファクトリーメソッド
  static create(id: UserAccountId, name: string): [UserAccount, UserAccountCreated] {
    const account = new UserAccount(id, name, 1, 1);
    const event = new UserAccountCreated(id, name);
    return [account, event];
  }

  // コマンドメソッド
  rename(newName: string): [UserAccount, UserAccountRenamed] {
    const updated = new UserAccount(
      this.id,
      newName,
      this.sequenceNumber + 1,
      this.version + 1
    );
    const event = new UserAccountRenamed(this.id, newName);
    return [updated, event];
  }

  // イベントソーシングのためのイベントリプレイ
  static replay(events: UserAccountEvent[], snapshot?: UserAccount): UserAccount {
    let account = snapshot ?? throw new Error("Initial snapshot required");
    for (const event of events) {
      account = account.applyEvent(event);
    }
    return account;
  }

  private applyEvent(event: UserAccountEvent): UserAccount {
    if (event instanceof UserAccountRenamed) {
      return new UserAccount(
        this.id,
        event.name,
        this.sequenceNumber + 1,
        this.version + 1
      );
    }
    return this;
  }
}
```

### 2. イベントストアを使用したリポジトリ

**リポジトリレイヤー** (`packages/command/interface-adaptor-impl/`):

```typescript
import { EventStore } from 'event-store-adapter-js';

export class UserAccountRepository {
  constructor(
    private readonly eventStore: EventStore<
      UserAccountId,
      UserAccount,
      UserAccountEvent
    >
  ) {}

  async storeEvent(event: UserAccountEvent, version: number): Promise<void> {
    await this.eventStore.persistEvent(event, version);
  }

  async storeEventAndSnapshot(
    event: UserAccountEvent,
    snapshot: UserAccount
  ): Promise<void> {
    await this.eventStore.persistEventAndSnapshot(event, snapshot);
  }

  async findById(id: UserAccountId): Promise<UserAccount | undefined> {
    const snapshot = await this.eventStore.getLatestSnapshotById(
      id,
      convertJSONToUserAccount
    );

    if (!snapshot) return undefined;

    const events = await this.eventStore.getEventsByIdSinceSequenceNumber(
      id,
      snapshot.sequenceNumber + 1,
      convertJSONToUserAccountEvent
    );

    return UserAccount.replay(events, snapshot);
  }
}
```

### 3. GraphQL ミューテーション (書き込み API)

**GraphQL リゾルバー** (`packages/command/interface-adaptor-impl/`):

```typescript
import { Resolver, Mutation, Arg } from 'type-graphql';

@Resolver()
export class UserAccountMutationResolver {
  constructor(private readonly repository: UserAccountRepository) {}

  @Mutation(() => UserAccountPayload)
  async createUserAccount(
    @Arg('input') input: CreateUserAccountInput
  ): Promise<UserAccountPayload> {
    const id = new UserAccountId(ulid());
    const [account, event] = UserAccount.create(id, input.name);

    await this.repository.storeEventAndSnapshot(event, account);

    return { userAccountId: id.value };
  }

  @Mutation(() => UserAccountPayload)
  async renameUserAccount(
    @Arg('input') input: RenameUserAccountInput
  ): Promise<UserAccountPayload> {
    const id = new UserAccountId(input.userAccountId);
    const account = await this.repository.findById(id);

    if (!account) throw new Error('Account not found');

    const [updated, event] = account.rename(input.newName);
    await this.repository.storeEvent(event, updated.version);

    return { userAccountId: id.value };
  }
}
```

### 4. リードモデルプロジェクション (RMU)

**イベントプロセッサー** (`packages/rmu/`):

```typescript
export class UserAccountProjection {
  constructor(private readonly prisma: PrismaClient) {}

  async handleUserAccountCreated(event: UserAccountCreated): Promise<void> {
    await this.prisma.userAccountReadModel.create({
      data: {
        id: event.aggregateId.value,
        name: event.name,
        createdAt: event.occurredAt,
        updatedAt: event.occurredAt,
      },
    });
  }

  async handleUserAccountRenamed(event: UserAccountRenamed): Promise<void> {
    await this.prisma.userAccountReadModel.update({
      where: { id: event.aggregateId.value },
      data: {
        name: event.name,
        updatedAt: event.occurredAt,
      },
    });
  }
}
```

### 5. GraphQL クエリ (読み取り API)

**クエリリゾルバー** (`packages/query/interface-adaptor/`):

```typescript
@Resolver()
export class UserAccountQueryResolver {
  constructor(private readonly prisma: PrismaClient) {}

  @Query(() => UserAccountReadModel, { nullable: true })
  async userAccount(
    @Arg('id') id: string
  ): Promise<UserAccountReadModel | null> {
    return this.prisma.userAccountReadModel.findUnique({
      where: { id },
    });
  }

  @Query(() => [UserAccountReadModel])
  async userAccounts(): Promise<UserAccountReadModel[]> {
    return this.prisma.userAccountReadModel.findMany();
  }
}
```

---

## Kiro ワークフロー: AI 駆動開発

### ワークフローフェーズ

Kiro 仕様駆動ワークフローは、AI 支援による体系的な機能開発を可能にします：

```
フェーズ 0: ステアリング（オプション）
    ↓
フェーズ 1: 仕様化
    ├─ 要件の発見
    ├─ ギャップ分析（オプション）
    ├─ 技術設計
    ├─ 設計レビュー（オプション）
    └─ タスク生成
    ↓
フェーズ 2: 実装
    ├─ TDD 駆動のコーディング
    └─ 検証（オプション）
```

### コマンドリファレンス

すべてのコマンドは、Claude Code (`/kiro:*`)、Gemini、Codex で適切な設定により動作します。

#### フェーズ 0: プロジェクトステアリング（オプション）

```bash
# プロジェクト全体のアーキテクチャ決定を初期化
/kiro:steering

# カスタムステアリングドキュメントの追加（API 標準、テスト戦略など）
/kiro:steering-custom
```

**目的**: 機能間で一貫した AI ガイダンスのためのプロジェクトメモリを確立します。

#### フェーズ 1: 仕様化

```bash
# 1. 新しい機能仕様の初期化
/kiro:spec-init "JWT とリフレッシュトークンを使ったユーザー認証"

# 2. 詳細な要件の生成
/kiro:spec-requirements authentication

# 3. (オプション) 既存コードベースのギャップ分析
/kiro:validate-gap authentication

# 4. 技術設計ドキュメントの作成
/kiro:spec-design authentication [-y]  # -y は承認プロンプトをスキップ

# 5. (オプション) 設計品質のレビュー
/kiro:validate-design authentication

# 6. 実装タスクの生成
/kiro:spec-tasks authentication [-y]

# いつでも進捗確認
/kiro:spec-status authentication
```

#### フェーズ 2: 実装

```bash
# TDD 手法でタスクを実行
/kiro:spec-impl authentication          # すべてのタスク
/kiro:spec-impl authentication 1,2,3    # 特定のタスク

# 仕様に対する実装の検証
/kiro:validate-impl authentication
```

### ステアリング vs. 仕様

| 側面 | ステアリング (`.kiro/steering/`) | 仕様 (`.kiro/specs/`) |
|------|----------------------------------|------------------------|
| **スコープ** | プロジェクト全体のパターン | 機能固有の設計 |
| **ライフタイム** | 長期（数ヶ月/数年） | 短期（数日/数週間） |
| **内容** | アーキテクチャ決定、規約 | 要件、設計、タスク |
| **例** | "すべての API に GraphQL を使用" | "ユーザー認証の実装" |
| **ファイル** | `product.md`, `tech.md`, `structure.md` | `requirements.md`, `design.md`, `tasks.md` |

### ベストプラクティス

1. **ステアリングセットアップ**: 機能開発を始める前にステアリングドキュメントを初期化
2. **人間によるレビュー**: 各フェーズ（要件 → 設計 → タスク）を進める前にレビュー
3. **`-y` の慎重な使用**: 自動承認（`-y`）はレビューゲートをバイパス—シンプルな更新にのみ使用
4. **ステアリングの最新化**: アーキテクチャ決定の進化に合わせてステアリングドキュメントを更新
5. **ギャップ分析**: 既存のコードベースに機能を追加する際は `/kiro:validate-gap` を実行
6. **設計検証**: 重要または複雑な機能には `/kiro:validate-design` を使用

---

## プロジェクト構造

```
cqrs-es-spec-kit-js/
├── .kiro/                        # Kiro ワークフロー設定
│   ├── steering/                # プロジェクト全体のアーキテクチャ決定
│   │   ├── product.md          # プロダクトビジョンとドメイン
│   │   ├── tech.md             # 技術スタックと標準
│   │   └── structure.md        # コード構成パターン
│   ├── specs/                   # 機能仕様（生成されたもの）
│   │   └── {feature-name}/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── settings/                # ワークフローテンプレートとルール
│       ├── rules/               # AI の動作ルール
│       └── templates/           # ドキュメントテンプレート
│
├── references/                   # 参照実装（サブモジュール）
│   ├── event-store-adapter-js/ # イベントストアライブラリ
│   └── cqrs-es-example-js/     # 本番環境例
│
├── packages/                     # あなたのアプリケーションコード（作成予定）
│   ├── command/                 # 書き込み側
│   ├── query/                   # 読み取り側
│   ├── rmu/                     # リードモデルアップデーター
│   └── infrastructure/          # 共有インフラストラクチャ
│
├── scripts/                      # 開発とデプロイメントスクリプト
├── AGENTS.md                    # AI エージェント指示
├── CLAUDE.md                    # Claude Code 設定
├── GEMINI.md                    # Gemini 設定
└── package.json
```

---

## 参照実装

### イベントストアアダプター

イベントの永続化と取得のための基盤ライブラリ：

- **リポジトリ**: [event-store-adapter-js](https://github.com/j5ik2o/event-store-adapter-js)
- **バックエンド**: 楽観的ロックを備えた DynamoDB
- **機能**: イベント永続化、スナップショット管理、ストリームクエリ
- **インストール**: `npm install event-store-adapter-js`
- **使用法**: ランタイム使用のために `package.json` の依存関係に追加

### CQRS/ES 例

すべてのパターンを実証する完全な動作実装：

- **リポジトリ**: [cqrs-es-example-js](https://github.com/j5ik2o/cqrs-es-example-js)
- **機能**:
  - 書き込み API（GraphQL ミューテーション）
  - 読み取り API（GraphQL クエリ）
  - リードモデルアップデーター（ローカルと AWS Lambda）
  - Docker Compose セットアップ
- **ユースケース**: AI ツールがパターンを読み取り学習するための参照実装

### 参照ディレクトリ (`references/`)

**重要**: `references/` ディレクトリには **AI コード読み取り専用** のサブモジュールが含まれています。これらは実行時の依存関係ではありません。

- **目的**: AI ツール（Claude Code、Gemini、Codex）に具体的な実装例を提供
- **場所**: Git サブモジュールとして含まれる
- **使用法**: AI ツールがパターンを分析；実際の npm パッケージは `package.json` に追加

```bash
# 最新パターンのために参照コードを更新
git submodule update --remote

# 例を探索（学習用、依存関係としてではない）
cd references/cqrs-es-example-js
npm install
docker-compose up -d
npm run build
npm test

# 実際のプロジェクト依存関係は package.json に記述
npm install event-store-adapter-js  # ランタイム依存関係
```

---

## 開発ガイドライン

### ドメインモデリング

1. **集約**: 小さく保ち、単一のトランザクション境界に焦点を当てる
2. **値オブジェクト**: 不変にし、コンストラクタで検証
3. **ドメインイベント**: 過去形の命名（`UserAccountCreated`、`CreateUserAccount` ではなく）
4. **コマンドメソッド**: 不変性のためにタプル `[newState, event]` を返す

### イベントソーシング

1. **スナップショット**: リプレイを最適化するために定期的に作成（例: 10〜50 イベントごと）
2. **イベントバージョニング**: 初日からスキーマ進化を計画
3. **冪等性**: リトライ安全性のためにイベントハンドラーが冪等であることを確認
4. **シリアライゼーション**: JSON ↔ ドメインオブジェクトのための明示的な変換関数を使用

### CQRS

1. **書き込みモデル**: 一貫性とビジネスロジックのために最適化
2. **読み取りモデル**: クエリパフォーマンスのために非正規化
3. **結果整合性**: 伝播遅延を処理するように UI を設計
4. **複数のプロジェクション**: 異なるユースケースのために特化したリードモデルを作成

### GraphQL API

1. **ミューテーション**: 集約コマンドに 1:1 でマップ（例: `createUserAccount`）
2. **クエリ**: リードモデルからのみフェッチ、イベントストアからは絶対にフェッチしない
3. **型安全性**: スキーマ生成のために TypeGraphQL デコレーターを使用
4. **エラーハンドリング**: 適切な GraphQL エラー拡張を持つ構造化されたエラーを返す

---

## AI ツール設定

### Claude Code

- **コマンド**: `/kiro:*` 名前空間（例: `/kiro:spec-init`、`/kiro:spec-impl`）
- **設定**: プロジェクト固有の指示については `CLAUDE.md` を参照
- **統合**: `.kiro/steering/` の自動ロード

### Gemini

- **コマンド**: `GEMINI.md` 設定による同じ `/kiro:*` 名前空間
- **プロンプト**: `.gemini/` ディレクトリのカスタムプロンプト

### Codex

- **コマンド**: `.codex/` ディレクトリによる同じ `/kiro:*` 名前空間
- **ワークフロー**: Cursor ベースのワークフロー統合

すべての AI ツールは、`.kiro/` 内の同じ基礎となる Kiro ワークフローと仕様を共有します。

---

## テスト戦略

### ユニットテスト
- ドメインロジック（集約、値オブジェクト）
- イベントのシリアライゼーション/デシリアライゼーション
- ビジネスルール検証

### 統合テスト
- インメモリイベントストアを使用したリポジトリ操作
- GraphQL リゾルバーの動作
- リードモデルプロジェクションロジック

### エンドツーエンドテスト
- 完全なコマンド実行（ミューテーション → イベント → プロジェクション → クエリ）
- Docker Compose 環境テスト
- イベントリプレイとスナップショット復旧

---

## デプロイメント

### ローカル開発
```bash
docker-compose up -d          # DynamoDB と PostgreSQL を起動
npm run build                 # すべてのパッケージをビルド
npm run dev                   # 開発モードで起動
```

### 本番環境の考慮事項

- **イベントストア**: オートスケーリングを備えた DynamoDB
- **リードモデル**: リードレプリカを備えた PostgreSQL
- **RMU**: DynamoDB Streams トリガーを備えた AWS Lambda
- **API**: コンテナ化された GraphQL サーバー（ECS/EKS）
- **モニタリング**: イベント処理遅延のための CloudWatch

---

## ライセンス

このプロジェクトはデュアルライセンスです：

- **MIT ライセンス**: [LICENSE-MIT](./LICENSE-MIT) を参照
- **Apache License 2.0**: [LICENSE-APACHE](./LICENSE-APACHE) を参照

このテンプレートの使用にはいずれかのライセンスを選択できます。

---

## コントリビューション

コントリビューションを歓迎します！以下の手順に従ってください：

1. リポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを開く

---

## 関連リソース

- [Event Store Adapter ドキュメント](https://github.com/j5ik2o/event-store-adapter-js)
- [CQRS/ES Example ドキュメント](https://github.com/j5ik2o/cqrs-es-example-js)
- [ドメイン駆動設計リファレンス](https://www.domainlanguage.com/ddd/reference/)
- [CQRS パターン (Microsoft)](https://docs.microsoft.com/ja-jp/azure/architecture/patterns/cqrs)
- [イベントソーシングパターン](https://martinfowler.com/eaaDev/EventSourcing.html)

---

## サポート

質問や議論については：

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/cqrs-es-spec-kit-js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/cqrs-es-spec-kit-js/discussions)

---

**DDD/CQRS/ES コミュニティのために ❤️ を込めて構築**
