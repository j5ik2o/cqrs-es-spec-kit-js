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
- **AI 駆動仕様**: AI ツール（Codex, Claude Code, Cursor Agent, Gemini）を活用した Kiro スタイルの体系的な機能開発ワークフロー

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
- ✅ **マルチ AI サポート**: Codex, Claude Code, Cursor Agent, Gemini に対応
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

#### 必須

| ツール | 説明 |
|--------|------|
| **Nix** | flakes 有効のパッケージマネージャー（[インストール](https://nix.dev/install-nix)） |
| **Docker** | コンテナランタイム |
| **Git** | バージョン管理 |

セットアップ手順は以下を参照してください:
- [Nix セットアップ](docs/NIX_SETUP.ja.md)
- [direnv セットアップ](docs/DIRENV_SETUP.ja.md)

#### 対応OS

- macOS / Linux: そのまま利用可能
- Windows: WSL2 上で実行（Ubuntu など）し、Docker Desktop の WSL 統合を有効化すること
- すべてのコマンドは WSL のシェルから実行する前提

#### 知識の前提条件

- DDD、CQRS/ES、GraphQL の基本的な理解
- AI コーディングツール: Claude Code、Gemini、または Codex

### インストール

1. **Nix をインストール**（未インストールの場合）:
   ```bash
   # https://nix.dev/install-nix の手順に従ってください
   curl -L https://nixos.org/nix/install | sh

   # flakes を有効化（~/.config/nix/nix.conf に追加）
   echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
   ```

2. **クローンして開発環境に入る**:
   ```bash
   git clone --recursive https://github.com/j5ik2o/cqrs-es-spec-kit-js.git
   cd cqrs-es-spec-kit-js

   # 開発環境に入る（Node.js、pnpm、Docker ツール、AWS CLI、jq、curl が含まれます）
   nix develop
   # もしくは
   # direnv allow

   # 依存関係をインストール
   pnpm install
   ```

3. **参照実装の確認** (AI コード読み取り用):
   ```bash
   # references/ ディレクトリには AI ツールが参照するためのサンプルコードが含まれています
   # これらは実行時の依存関係としては使用されません

   # 完全な動作例を確認
   cd references/cqrs-es-example-js

   # イベントストアアダプターの実装パターンを確認
   cd references/event-store-adapter-js
   ```

---

## 実装例: Cart ドメイン

このリポジトリには、完全な CQRS/ES スタックを実証する **Cart ドメイン** の実装が含まれています：

### ドメインモデル

**集約ルート**: `Cart` (modules/command/domain/src/cart/)
- 値オブジェクト: `CartId`, `CartName`
- エンティティ: `CartItem`（`CartItemId`, `Quantity`, `Price` を持つ）
- ドメインイベント: `CartCreated`, `CartItemAdded`, `CartItemRemoved`, `CartDeleted`

**主な特徴**:
- `replay()` と `applyEvent()` メソッドによるイベントソーシング
- `[newState, event]` タプルを返す不変なコマンドメソッド
- `CartRepositoryImpl` によるスナップショット最適化（100 イベントごと）

### モジュール構造

```
modules/
├── command/
│   ├── domain/                      # Cart 集約とイベント
│   ├── interface-adaptor-if/        # CartRepository インターフェース
│   ├── interface-adaptor-impl/      # EventStore 統合
│   └── processor/                   # CartCommandProcessor
├── query/
│   └── interface-adaptor/           # GraphQL クエリリゾルバー
├── rmu/
│   └── src/                         # リードモデルアップデーター（Prisma）
├── infrastructure/                  # 共有インフラストラクチャユーティリティ
└── bootstrap/
    └── src/
        ├── write-api-main.ts        # コマンド API サーバー
        ├── read-api-main.ts         # クエリ API サーバー
        ├── local-rmu-main.ts        # ローカル RMU（開発用）
        └── lambda-rmu-handler.ts    # Lambda ベース RMU（Docker/本番用）
```

### 実装例の実行

#### オプション 1: Docker を使用（推奨）

1. **Docker イメージをビルド**:
   ```bash
   ./tools/docker/docker-build.sh
   ```

2. **全サービスを起動**:
   ```bash
   ./tools/docker/docker-up.sh
   ```

3. **E2E テストを実行**:
   ```bash
   ./tools/e2e-test/verify-cart.sh
   ```

4. **ログを表示**:
   ```bash
   ./tools/docker/docker-logs.sh
   ```

5. **全サービスを停止**:
   ```bash
   ./tools/docker/docker-down.sh
   ```

**利用可能なサービス**:
- Write API: http://localhost:38080
- Read API: http://localhost:38082
- リードモデルアップデーター: Lambda ベース（DynamoDB Streams で自動実行）
- DynamoDB Admin: http://localhost:38003
- phpMyAdmin: http://localhost:24040

#### オプション 2: ローカル実行

1. **インフラを起動**:
   ```bash
   docker-compose up -d mysql localstack dynamodb-setup dynamodb-admin phpmyadmin migration lambda-setup
   ```

2. **ビルドとサーバー起動**:
   ```bash
   pnpm install
   pnpm build

   # ターミナル 1: Write API（ポート 38080）
   node modules/bootstrap/dist/index.js writeApi

   # ターミナル 2: Read API（ポート 38082）
   node modules/bootstrap/dist/index.js readApi

   # 注: リードモデルアップデーターは DynamoDB Streams によりトリガーされる Lambda 関数として実行
   # （docker-compose の lambda-setup で起動）
   ```

3. **E2E テストを実行**:
   ```bash
   ./tools/e2e-test/verify-cart.sh
   ```

### GraphQL API 例

**カートを作成**:
```graphql
mutation {
  createCart(input: {
    name: "Sample Cart"
    executorId: "UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
  }) {
    cartId
  }
}
```

**アイテムを追加**:
```graphql
mutation {
  addItemToCart(input: {
    cartId: "Cart-01234567890"
    name: "Product A"
    quantity: 2
    price: 1000
    executorId: "UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
  }) {
    cartId
    itemId
  }
}
```

**カートをクエリ**:
```graphql
query {
  getCart(cartId: "Cart-01234567890") {
    id
    name
    deleted
    createdAt
    updatedAt
  }
}
```

### 実装例からの学び

この実装は以下を実証しています：
- ✅ リプレイメカニズムを持つイベントソース化された集約
- ✅ DynamoDB バックエンドとの EventStore 統合
- ✅ パフォーマンス最適化のためのスナップショット戦略
- ✅ GraphQL API による CQRS 分離
- ✅ Prisma によるリードモデルプロジェクション
- ✅ ローカル開発のための LocalStack 統合
- ✅ 完全な E2E テストカバレッジ

**同じパターンに従って独自のドメインモデルを構築する際の参照**としてご活用ください。

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
pnpm codex            # Codex を起動
pnpm claude           # Claude Code を起動
pnpm cursor           # Cursor Agent を起動
pnpm gemini           # Gemini を起動
```

### テスト
```bash
pnpm verify-cart     # Cart ドメインの E2E テストを実行
pnpm test             # ユニットテストを実行
```

### ビルド・品質
```bash
pnpm build            # 全パッケージをビルド
pnpm lint             # Lint を実行
pnpm format           # コードフォーマットをチェック
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
  │ (DynamoDB)  │         │ (DynamoDB)  │        │   (MySQL)   │
  └─────────────┘         └─────────────┘        └─────────────┘
```

### レイヤー構造

クリーンアーキテクチャと DDD 戦術パターンに基づいています：

```
modules/
├── command/                      # 書き込み側 (CQRS)
│   ├── domain/                  # 純粋なドメインロジック
│   │   └── src/cart/            # Cart 集約、イベント、値オブジェクト
│   ├── interface-adaptor-if/    # ポート定義（CartRepository インターフェース）
│   ├── interface-adaptor-impl/  # アダプター実装（EventStore 統合）
│   └── processor/               # アプリケーションサービス（CartCommandProcessor）
│
├── query/                        # 読み取り側 (CQRS)
│   └── interface-adaptor/       # GraphQL リゾルバーとリードモデル DTO
│
├── rmu/                          # リードモデルアップデーター
│   └── src/                     # イベントハンドラーとプロジェクション
│
├── infrastructure/               # 共有インフラストラクチャユーティリティ
│
└── bootstrap/                    # アプリケーションエントリーポイント
    └── src/                     # サーバー起動ファイル
```

---

## 実装パターン

### 1. イベントソース化された集約

**ドメインレイヤー** (`modules/command/domain/src/cart/cart.ts`):

```typescript
// cart.ts
class Cart implements Aggregate<Cart, CartId> {
  public readonly id: CartId;
  public readonly deleted: boolean;
  public readonly name: CartName;
  public readonly items: CartItems;
  public readonly sequenceNumber: number;
  public readonly version: number;

  private constructor(params: CartParams) {
    this.id = params.id;
    this.deleted = params.deleted;
    this.name = params.name;
    this.items = params.items;
    this.sequenceNumber = params.sequenceNumber;
    this.version = params.version;
  }

  // ファクトリーメソッド
  static create(id: CartId, name: CartName, executorId: UserAccountId): [Cart, CartCreated] {
    const sequenceNumber = 1;
    const cart = new Cart({
      id,
      deleted: false,
      name,
      items: CartItems.empty(),
      sequenceNumber,
      version: 1,
    });
    const event = CartCreated.of(id, name, executorId, sequenceNumber);
    return [cart, event];
  }

  // エラーハンドリング付きコマンドメソッド（Either を返す）
  addItem(item: CartItem, executorId: UserAccountId): Either<CartAddItemError, [Cart, CartItemAdded]> {
    if (this.deleted) {
      return E.left(CartAddItemError.of("The cart is deleted"));
    }
    const newItems = this.items.addItem(item);
    const newSequenceNumber = this.sequenceNumber + 1;
    const newCart = new Cart({ ...this, items: newItems, sequenceNumber: newSequenceNumber });
    const event = CartItemAdded.of(this.id, item, executorId, newSequenceNumber);
    return E.right([newCart, event]);
  }

  // イベントソーシングのためのリプレイ
  static replay(events: CartEvent[], snapshot: Cart): Cart {
    return events.reduce((cart, event) => cart.applyEvent(event), snapshot);
  }

  applyEvent(event: CartEvent): Cart {
    switch (event.symbol) {
      case CartItemAddedTypeSymbol:
        return this.addItem((event as CartItemAdded).item, event.executorId).right[0];
      case CartItemRemovedTypeSymbol:
        return this.removeItem((event as CartItemRemoved).item.id, event.executorId).right[0];
      case CartDeletedTypeSymbol:
        return this.delete(event.executorId).right[0];
      default:
        throw new Error("Unknown event");
    }
  }
}
```

### 2. イベントストアを使用したリポジトリ

**リポジトリレイヤー** (`modules/command/interface-adaptor-impl/src/repository/cart/cart-repository.ts`):

```typescript
import { type EventStore, OptimisticLockError } from 'event-store-adapter-js';
import * as TE from 'fp-ts/TaskEither';

type SnapshotDecider = (event: CartEvent, snapshot: Cart) => boolean;

class CartRepositoryImpl implements CartRepository {
  private constructor(
    public readonly eventStore: EventStore<CartId, Cart, CartEvent>,
    private readonly snapshotDecider: SnapshotDecider | undefined,
  ) {}

  store(event: CartEvent, snapshot: Cart): TE.TaskEither<RepositoryError, void> {
    if (event.isCreated || this.snapshotDecider?.(event, snapshot)) {
      return this.storeEventAndSnapshot(event, snapshot);
    }
    return this.storeEvent(event, snapshot.version);
  }

  storeEvent(event: CartEvent, version: number): TE.TaskEither<RepositoryError, void> {
    return TE.tryCatch(
      () => this.eventStore.persistEvent(event, version),
      (reason) => new RepositoryError("Failed to store event", reason as Error),
    );
  }

  findById(id: CartId): TE.TaskEither<RepositoryError, Cart | undefined> {
    return TE.tryCatch(
      async () => {
        const snapshot = await this.eventStore.getLatestSnapshotById(id);
        if (snapshot === undefined) return undefined;
        const events = await this.eventStore.getEventsByIdSinceSequenceNumber(
          id, snapshot.sequenceNumber + 1
        );
        return Cart.replay(events, snapshot);
      },
      (reason) => new RepositoryError("Failed to find by id", reason as Error),
    );
  }

  // 設定可能なスナップショット戦略（例: 100 イベントごと）
  withRetention(numberOfEvents: number): CartRepository {
    return new CartRepositoryImpl(
      this.eventStore,
      (event) => event.sequenceNumber % numberOfEvents === 0
    );
  }
}
```

### 3. GraphQL ミューテーション (書き込み API)

**GraphQL リゾルバー** (`modules/command/interface-adaptor-impl/src/graphql/resolvers.ts`):

```typescript
import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

@Resolver()
class CartCommandResolver {
  @Mutation(() => CartOutput)
  async createCart(
    @Ctx() { cartCommandProcessor }: CommandContext,
    @Arg("input") input: CreateCartInput,
  ): Promise<CartOutput> {
    return pipe(
      this.validateCartName(input.name),
      TE.chainW((validatedName) =>
        pipe(
          this.validateUserAccountId(input.executorId),
          TE.map((validatedExecutorId) => ({ validatedName, validatedExecutorId })),
        ),
      ),
      TE.chainW(({ validatedName, validatedExecutorId }) =>
        cartCommandProcessor.createCart(validatedName, validatedExecutorId),
      ),
      TE.map((cartEvent) => ({ cartId: cartEvent.aggregateId.asString() })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  @Mutation(() => CartItemOutput)
  async addItemToCart(
    @Ctx() { cartCommandProcessor }: CommandContext,
    @Arg("input") input: AddItemToCartInput,
  ): Promise<CartItemOutput> {
    return pipe(
      this.validateCartId(input.cartId),
      TE.chainW((validatedCartId) =>
        cartCommandProcessor.addItemToCart(validatedCartId, validatedItem, validatedExecutorId),
      ),
      TE.map((cartEvent) => ({
        cartId: cartEvent.aggregateId.asString(),
        itemId: validatedItem.id.asString(),
      })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }
}
```

### 4. リードモデルプロジェクション (RMU)

**イベントプロセッサー** (`modules/rmu/src/update-read-model.ts`):

```typescript
import type { DynamoDBStreamEvent } from "aws-lambda";
import { convertJSONToCartEvent, CartCreatedTypeSymbol, CartItemAddedTypeSymbol } from "cqrs-es-spec-kit-js-command-domain";

class ReadModelUpdater {
  constructor(private readonly cartDao: CartDao) {}

  async updateReadModel(event: DynamoDBStreamEvent): Promise<void> {
    for (const record of event.Records) {
      const payload = Buffer.from(record.dynamodb.NewImage.payload.B, "base64").toString("utf-8");
      const cartEvent = convertJSONToCartEvent(JSON.parse(payload));

      switch (cartEvent.symbol) {
        case CartCreatedTypeSymbol: {
          const typedEvent = cartEvent as CartCreated;
          await this.cartDao.insertCart(typedEvent.aggregateId, typedEvent.name, new Date());
          break;
        }
        case CartItemAddedTypeSymbol: {
          const typedEvent = cartEvent as CartItemAdded;
          await this.cartDao.insertCartItem(typedEvent.aggregateId, typedEvent.item, new Date());
          break;
        }
        case CartDeletedTypeSymbol: {
          const typedEvent = cartEvent as CartDeleted;
          await this.cartDao.deleteCart(typedEvent.aggregateId, new Date());
          break;
        }
      }
    }
  }
}
```

### 5. GraphQL クエリ (読み取り API)

**クエリリゾルバー** (`modules/query/interface-adaptor/src/graphql/resolvers.ts`):

```typescript
import type { PrismaClient } from "@prisma/client";
import { Arg, Ctx, Query, Resolver } from "type-graphql";

@Resolver()
class CartQueryResolver {
  @Query(() => CartQueryOutput)
  async getCart(@Ctx() { prisma }: QueryContext, @Arg("cartId") cartId: string): Promise<CartQueryOutput> {
    const carts = await prisma.$queryRaw<CartQueryOutput[]>`
      SELECT o.id, o.name, o.deleted, o.created_at as createdAt, o.updated_at as updatedAt
      FROM carts AS o WHERE o.id = ${cartId}`;
    if (!carts.length) throw new Error("Cart not found");
    return carts[0];
  }

  @Query(() => [CartQueryOutput])
  async getCarts(@Ctx() { prisma }: QueryContext): Promise<CartQueryOutput[]> {
    return prisma.$queryRaw<CartQueryOutput[]>`
      SELECT o.id, o.name, o.deleted, o.created_at as createdAt, o.updated_at as updatedAt
      FROM carts AS o WHERE o.deleted = false`;
  }

  @Query(() => [CartItemQueryOutput])
  async getCartItems(@Ctx() { prisma }: QueryContext, @Arg("cartId") cartId: string): Promise<CartItemQueryOutput[]> {
    return prisma.$queryRaw<CartItemQueryOutput[]>`
      SELECT oi.id, oi.cart_id as cartId, oi.name, oi.quantity, oi.price,
             oi.created_at as createdAt, oi.updated_at as updatedAt
      FROM carts AS o JOIN cart_items AS oi ON o.id = oi.cart_id
      WHERE o.deleted = false AND oi.cart_id = ${cartId}`;
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

すべてのコマンドは、Codex, Claude Code, Cursor Agent, Gemini で適切な設定により動作します。

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
├── modules/                      # アプリケーションコード
│   ├── command/                 # 書き込み側
│   ├── query/                   # 読み取り側
│   ├── rmu/                     # リードモデルアップデーター
│   ├── infrastructure/          # 共有インフラストラクチャ
│   └── bootstrap/               # アプリケーションエントリーポイント
│
├── tools/                        # 開発とデプロイメントツール
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

- **目的**: AI ツール（Codex, Claude Code, Gemini）に具体的な実装例を提供
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

### Codex

TODO

### Claude Code

TODO

### Cursor Agent

TODO

### Gemini

TODO

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

#### E2E テストの実行（Cart ドメイン例）

リポジトリには Cart ドメイン実装の包括的な E2E テストスクリプトが含まれています：

```bash
# 環境変数を設定（オプション、デフォルト値を表示）
export EXECUTOR_ID="UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
export WRITE_API_SERVER_BASE_URL="http://localhost:38080"
export READ_API_SERVER_BASE_URL="http://localhost:38082"

# E2E テストスクリプトを実行
./tools/e2e-test/verify-cart.sh
```

**テストカバレッジ**:
- ✅ カート作成（createCart ミューテーション）
- ✅ アイテム追加（addItem ミューテーション、2 アイテム）
- ✅ カート取得（getCart クエリ）
- ✅ カート一覧取得（getCarts クエリ）
- ✅ カートアイテム取得（getCartItem クエリ）
- ✅ カートアイテム一覧取得（getCartItems クエリ）
- ✅ アイテム削除（removeItemFromCart ミューテーション）
- ✅ カート削除（deleteCart ミューテーション）
- ✅ 結果整合性の検証（リードモデル更新）

**前提条件**:
- Write API サーバーがポート 38080 で実行中
- Read API サーバーがポート 38082 で実行中
- JSON 処理用の `jq` コマンドラインツールがインストール済み

---

## デプロイメント

### ローカル開発
```bash
docker-compose up -d          # DynamoDB と MySQL を起動
pnpm build                    # すべてのパッケージをビルド
```

### 本番環境の考慮事項

- **イベントストア**: オートスケーリングを備えた DynamoDB
- **リードモデル**: リードレプリカを備えた MySQL
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
