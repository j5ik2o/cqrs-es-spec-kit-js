# ギャップ分析: rename-order-to-cart

## 1. 現状調査（主要資産とパターン）

### ドメイン（command/domain）
- `modules/command/domain/src/order/` に Order 集約、OrderId/OrderName/OrderItem(s)、Order 系イベントとエラーが集中。
- イベント `typeName` 文字列や `Symbol("Order...")`、ID のプレフィックス（例: `Order-`）に Order が埋め込まれている。

### コマンド側（interface-adaptor / processor）
- interface-adaptor-if: `OrderRepository` が公開インタフェース。
- interface-adaptor-impl: GraphQL 入出力 (`CreateOrderInput` など)、`OrderCommandResolver`、`OrderRepositoryImpl`。
- processor: `OrderCommandProcessor` とそのメソッド名（`createOrder` / `addItemToOrder` など）。

### クエリ側（query/interface-adaptor）
- GraphQL: `OrderQueryResolver`、`OrderQueryOutput`、`OrderItemQueryOutput`。
- Prisma スキーマに `Orders` / `OrderItems` モデルがあり、`orders` / `order_items` テーブルへ `@@map`。

### RMU
- `OrderDao` と `ReadModelUpdater` が Order イベントを購読し、読み取りモデルへ反映。
- Prisma スキーマに `Orders` / `OrderItems` モデルが存在。

### Bootstrap
- `write-api-main.ts` / `lambda-rmu-handler.ts` / `local-rmu-main.ts` が Order 系の型・DAO を組み立て。

### データ/ツール
- SQL migration: `orders` / `order_items` テーブル。
- E2E スクリプト: `tools/e2e-test/verify-order.sh` が Order の GraphQL 名で検証。
- `tools/lambda-setup/deploy-lambda.sh` の `DATABASE_URL` が `orderdb` を使用。

### テスト配置
- すべて `*.test.ts` が実装ファイルの隣に配置されており、名称は Order を前提にしている。

## 2. 要件から導出される技術的ニーズ

- **ドメイン名の一貫性**: 集約/値オブジェクト/イベント/エラー/ID 文字列の Order→Cart 置換。
- **API 名称統一**: コマンド・クエリの GraphQL 型/フィールド/入力/出力/エラーメッセージの置換。
- **モジュール間公開 API**: Repository/Processor/DAO などの公開型名、関数名、export 集約の置換。
- **テスト/ドキュメント**: テスト名と説明、スクリプト、README/仕様書などの表記更新。

## 3. 要件―資産マップ（ギャップ付き）

| 要件 | 既存資産（代表例） | ギャップ | コメント |
|---|---|---|---|
| 1. ドメイン用語の統一 | `modules/command/domain/src/order/*` | Missing / Constraint | Order 系の型・イベント・エラーが全面に残存。イベント名/ID プレフィックスは既存データがある場合は移行が必要。 |
| 2. コマンド/クエリ API の名称統一 | `modules/command/interface-adaptor-impl/src/graphql/*`、`modules/query/interface-adaptor/src/graphql/*`、`tools/e2e-test/verify-order.sh` | Missing | GraphQL 型/フィールド/入力/出力/エラー文言が Order 前提。 |
| 3. モジュール間インタフェースの整合 | `OrderRepository`、`OrderCommandProcessor`、`OrderDao`、`ReadModelUpdater`、bootstrap 配線 | Missing | 公開型/関数名の一括置換が必要。 |
| 4. テスト・ドキュメントの整合 | `*.test.ts`（全モジュール）、`tools/`、ドキュメント | Missing / Unknown | テストは Order 前提。ドキュメント範囲は未調査のため Unknown。 |

## 4. 主要ギャップ・制約

- **イベントストア互換**: `typeName` が Order 系のままのイベントが保存済みなら変換/移行が必要（Constraint）。
- **DB スキーマ命名**: `orders` / `order_items` テーブル名を変更するかは設計判断。変更するなら移行が必要（Constraint）。
- **外部参照**: E2E スクリプトや環境設定（`orderdb`）が存在。更新範囲の洗い出しが必要（Research Needed）。
- **ドキュメント群**: README / openspec / references などの Order 表記の範囲が未特定（Research Needed）。

## 5. 実装アプローチ案

### Option A: 既存コンポーネントを全面リネーム（in-place）
- **方針**: Order を Cart に一括置換。GraphQL/Prisma/SQL/テスト/スクリプトも同時に更新。
- **トレードオフ**:
  - ✅ 命名の整合性が最も高い
  - ✅ 破壊的変更を許容する方針と一致
  - ❌ 変更範囲が広く、テスト修正量が大きい
  - ❌ 既存データがある場合は移行コストが発生

### Option B: Cart を新設し、Order を内部互換レイヤとして残す
- **方針**: 公開 API は Cart 名に切り替え、内部で Order をラップして段階的に削除。
- **トレードオフ**:
  - ✅ 段階的移行が可能
  - ✅ 既存データ/イベントに対する変換点を設けやすい
  - ❌ 二重構造で認知負荷が増える
  - ❌ 「Order を公開 API に含めない」要件と衝突しやすい

### Option C: 公開 API は Cart、永続層は Order 名を維持（ハイブリッド）
- **方針**: コード/GraphQL は Cart に統一し、DB テーブルやイベント名は Order を維持。
- **トレードオフ**:
  - ✅ DB 移行を回避できる可能性
  - ✅ コード側の命名は統一できる
  - ❌ 永続層との命名不一致が残り、説明コストが増える
  - ❌ 将来的な整合性担保が難しい

## 6. 工数とリスク（目安）

- **Option A**: Effort M / Risk Medium  
  理由: 変更範囲は広いが既存構造に沿った置換で完結可能。既存データがあればリスク増。
- **Option B**: Effort L / Risk Medium-High  
  理由: 変換/互換層の設計が必要で複雑化しやすい。
- **Option C**: Effort M / Risk Medium  
  理由: DB 移行は抑えられるが命名不一致の恒常リスクが残る。

## 7. デザインフェーズへの持ち越し（推奨検討事項）

- **推奨候補**: Option A を軸に、DB/イベント名の扱いを設計で確定する。
- **設計上の意思決定ポイント**:
  1. イベント `typeName` と既存データの移行有無
  2. `orders` / `order_items` を `carts` / `cart_items` に変更するか
  3. `orderdb` など環境名を変更するか（必要最小限か）
- **Research Needed**:
  - README / openspec / references 内の Order 表記の洗い出し
  - 既存データ（イベントストア/DB）の有無と移行方針

