# Proposal: Skeletonコード生成

## 概要
参照実装(`references/cqrs-es-example-js`)を元に、CQRS/Event Sourcingアーキテクチャの基本構造を持つSkeletonコードを生成する。このSkeletonは、新しいドメインモデルを実装する際のテンプレートとして機能し、プロジェクト規約に従った標準的な構造を提供する。

## 背景と動機
現在のプロジェクトには設定ファイル(`package.json`, `tsconfig.json`, `jest.config.ts`, `biome.json`)は整備されているが、ドメインモデルの実装例が存在しない。新規開発者がドメインモデルを実装する際に参照できるSkeletonコードを用意することで、以下を実現する：

- アグリゲート、値オブジェクト、ドメインイベントの標準的な実装パターンの明示
- プロジェクト規約（型安全性、イベント命名規則、テスト構造）の具体例の提供
- 参照実装との一貫性を保ちながら、独自のドメインモデル実装を加速

## 対象範囲
以下のモジュールにSkeletonコードを生成する：

### modules/command/domain
- サンプルアグリゲート（`Order`）
  - `Order` アグリゲートルート
  - `OrderId`, `OrderName` 値オブジェクト
  - `OrderItem`, `OrderItems` エンティティコレクション
  - `order-events.ts` ドメインイベント定義
  - `order-errors.ts` ドメインエラー定義

### modules/command/interface-adaptor-if
- リポジトリインターフェース
  - `OrderRepository` インターフェース

### modules/command/interface-adaptor-impl
- GraphQL Mutation実装
  - `CreateOrderInput`, `AddOrderItemInput` 入力型
  - `OrderMutationResolver` リゾルバ

### modules/command/processor
- コマンドプロセッサ
  - `OrderCommandProcessor`

### modules/query/interface-adaptor
- GraphQL Query実装
  - `OrderQueryResolver` リゾルバ
  - Prismaスキーマ定義

### modules/rmu
- Read Model Updater
  - イベントハンドラ実装

### modules/infrastructure
- 共通ユーティリティ（既存のまま）

### modules/bootstrap
- エントリーポイント（既存の構造を拡張）

## 設計上の決定

### 1. ドメインモデル選択
**選択**: `Order`（注文）アグリゲート
**理由**:
- 参照実装の`GroupChat`よりシンプルで理解しやすい
- ビジネスドメインとして一般的で、多くの開発者が理解できる
- アグリゲート内のエンティティコレクション（OrderItems）でパターンを示せる

### 2. イベント命名規則
**選択**: 過去分詞形（`OrderCreated`, `OrderItemAdded`）
**理由**: プロジェクト規約に従い、事実の記録として明確

### 3. エラーハンドリング
**選択**: `fp-ts/Either`を使用した関数型エラーハンドリング
**理由**: 参照実装との一貫性、型安全なエラー伝搬

### 4. テスト構造
**選択**: Given/When/Then形式のシナリオテスト
**理由**: プロジェクト規約に従い、仕様とテストの対応を明確化

## 実装アプローチ
1. 参照実装の`GroupChat`構造を分析
2. `Order`ドメインに置き換えた最小限の実装を生成
3. 各層（Domain, Processor, Interface Adaptor）の依存関係を正しく構築
4. テストコードも合わせて生成し、実行可能な状態を保つ

## 影響範囲
- **新規ファイル作成**: 約30-40ファイル
- **既存ファイル変更**: `modules/bootstrap/src/index.ts` にOrderリゾルバを追加
- **依存関係**: 既存のcatalog設定済み依存関係のみ使用
- **破壊的変更**: なし

## リスクと緩和策

### リスク1: 参照実装との不整合
**緩和策**:
- 参照実装のファイル構造を忠実に模倣
- 命名規則、型定義パターンを厳密に従う

### リスク2: 実装の複雑さ
**緩和策**:
- 最小限の機能セット（Create, AddItem, Delete）に限定
- コメントで各パターンの意図を明示

### リスク3: テストの不足
**緩和策**:
- 各コマンドメソッドに対応するテストを必須で生成
- CIで自動実行可能な状態を維持

## 成功基準
- [ ] 全モジュールでSkeletonコードが生成される
- [ ] `pnpm build` が成功する
- [ ] `pnpm test` が成功する（生成されたテストが実行される）
- [ ] `pnpm lint` が成功する
- [ ] OrderアグリゲートのCRUD操作が実装されている
- [ ] GraphQL Mutation/Queryが動作する
- [ ] Read Model Updaterがイベントを処理できる

## 次のステップ
1. tasks.mdで実装タスクを定義
2. 各モジュールのSkeletonコードを順次生成
3. 統合テストで全体動作を確認
4. ドキュメント（README）にSkeletonの使い方を追記
