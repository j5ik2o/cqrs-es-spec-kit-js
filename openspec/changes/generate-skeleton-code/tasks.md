# タスク一覧: Skeletonコード生成

## Phase 1: Domain層の基礎構築

### Task 1.1: Cart値オブジェクトの作成
**ファイル**:
- `modules/command/domain/src/cart/cart-id.ts`
- `modules/command/domain/src/cart/cart-name.ts`
- `modules/command/domain/src/cart/cart-item-id.ts`

**内容**:
- ULIDベースのCartId実装
- 不変なCartName値オブジェクト
- CartItemId値オブジェクト

**検証**:
- TypeScriptコンパイルが成功
- 値オブジェクトの等価性テストが通過

**依存**: なし

---

### Task 1.2: CartItemエンティティの作成
**ファイル**:
- `modules/command/domain/src/cart/cart-item.ts`
- `modules/command/domain/src/cart/cart-items.ts`

**内容**:
- CartItemエンティティ（ID, 名前, 数量, 価格）
- CartItemsコレクション（追加、削除、検索メソッド）

**検証**:
- コレクション操作のユニットテストが通過

**依存**: Task 1.1

---

### Task 1.3: ドメインイベントの定義
**ファイル**:
- `modules/command/domain/src/cart/cart-events.ts`
- `modules/command/domain/src/cart/cart-errors.ts`

**内容**:
- `CartCreated`, `CartItemAdded`, `CartItemRemoved`, `CartDeleted` イベント
- 各コマンドに対応するエラー型

**検証**:
- イベント型が正しくエクスポートされる
- エラー型がEither型で使用可能

**依存**: Task 1.1, 1.2

---

### Task 1.4: Cartアグリゲートルートの実装
**ファイル**:
- `modules/command/domain/src/cart/cart.ts`
- `modules/command/domain/src/cart/index.ts`

**内容**:
- Aggregateインターフェース実装
- コマンドメソッド: `create`, `addItem`, `removeItem`, `delete`
- 不変条件の検証ロジック
- イベント適用ロジック

**検証**:
- Given/When/Thenスタイルのアグリゲートテストが通過
- 全コマンドメソッドのテストカバレッジ

**依存**: Task 1.1, 1.2, 1.3

---

## Phase 2: Command層の実装

### Task 2.1: CartRepositoryインターフェースの定義
**ファイル**:
- `modules/command/interface-adaptor-if/src/cart-repository.ts`
- `modules/command/interface-adaptor-if/src/index.ts`

**内容**:
- `storeEvent`, `storeEventAndSnapshot`, `findById` メソッド定義
- event-store-adapter-jsの型との統合

**検証**:
- インターフェースが正しくエクスポートされる

**依存**: Task 1.4

---

### Task 2.2: CartCommandProcessorの実装
**ファイル**:
- `modules/command/processor/src/cart-command-processor.ts`
- `modules/command/processor/src/index.ts`

**内容**:
- リポジトリを使ったコマンド実行ロジック
- `createCart`, `addItemToCart`, `removeItemFromCart`, `deleteCart` メソッド

**検証**:
- インメモリリポジトリでのユニットテストが通過

**依存**: Task 2.1

---

### Task 2.3: GraphQL Mutation実装
**ファイル**:
- `modules/command/interface-adaptor-impl/src/resolvers/cart-command-resolver.ts`
- `modules/command/interface-adaptor-impl/src/inputs/create-cart-input.ts`
- `modules/command/interface-adaptor-impl/src/inputs/add-cart-item-input.ts`

**内容**:
- TypeGraphQLデコレータ付きリゾルバ
- 入力型定義
- CommandProcessorへの委譲

**検証**:
- GraphQLスキーマ生成が成功
- リゾルバのモックテストが通過

**依存**: Task 2.2

---

## Phase 3: Query層の実装

### Task 3.1: Prismaスキーマ定義
**ファイル**:
- `modules/query/interface-adaptor/prisma/schema.prisma` (Cart, CartItemテーブル追加)

**内容**:
- Cart, CartItemモデル定義
- リレーション設定

**検証**:
- `prisma generate` が成功
- `@prisma/client` が正しく生成される

**依存**: Task 1.4

---

### Task 3.2: GraphQL Query実装
**ファイル**:
- `modules/query/interface-adaptor/src/resolvers/cart-query-resolver.ts`
- `modules/query/interface-adaptor/src/index.ts`

**内容**:
- TypeGraphQLデコレータ付きクエリリゾルバ
- PrismaClientを使ったクエリ実装

**検証**:
- GraphQLスキーマ生成が成功
- クエリのモックテストが通過

**依存**: Task 3.1

---

## Phase 4: Read Model Updater

### Task 4.1: Cartイベントハンドラの実装
**ファイル**:
- `modules/rmu/src/cart-event-handler.ts`
- `modules/rmu/src/index.ts`

**内容**:
- `CartCreated`, `CartItemAdded` 等のイベントハンドラ
- PrismaClientを使ったRead Model更新

**検証**:
- イベントハンドラのユニットテストが通過
- イベントストリーム再生テストが通過

**依存**: Task 3.1, Task 1.3

---

## Phase 5: Bootstrap統合

### Task 5.1: Bootstrapへのリゾルバ登録
**ファイル**:
- `modules/bootstrap/src/index.ts` (既存ファイル更新)

**内容**:
- CartCommandResolver, CartQueryResolverをApolloServerに登録

**検証**:
- `pnpm start` でサーバーが起動
- GraphQL Playgroundでクエリ/ミューテーションが実行可能

**依存**: Task 2.3, Task 3.2

---

## Phase 6: 統合テストとドキュメント

### Task 6.1: E2Eテストの追加
**ファイル**:
- `modules/bootstrap/src/cart.test.ts`

**内容**:
- GraphQL Mutation/Queryの統合テスト
- イベント発行→RMU処理→Query確認のフロー

**検証**:
- E2Eテストが全て通過

**依存**: Task 5.1, Task 4.1

---

### Task 6.2: READMEの更新
**ファイル**:
- `README.md` (Skeletonセクション追加)

**内容**:
- Skeletonの概要説明
- 各モジュールの役割
- 新規ドメインモデル追加手順

**検証**:
- ドキュメントが明確で理解しやすい

**依存**: Task 6.1

---

## 並列実行可能なタスク
- **Phase 1内**: Task 1.1, 1.2, 1.3は並列実行可能（1.4が統合）
- **Phase 2と3**: Task 2系統とTask 3系統は並列実行可能

## 重要な検証ポイント
- [ ] 全タスク完了後、`pnpm build` が成功
- [ ] 全タスク完了後、`pnpm test` が成功
- [ ] 全タスク完了後、`pnpm lint` が成功
- [ ] GraphQL Playgroundで実際にCart作成→クエリ→アイテム追加が動作
- [ ] イベントストアにイベントが正しく保存される
- [ ] Read Modelが正しく更新される
