# 調査と設計判断

---
**目的**: 技術設計に影響する調査結果と判断根拠を記録する。

**用途**:
- 発見事項や調査ログを記録する。
- `design.md` に載せるには詳細すぎる判断の理由を残す。
- 後日の監査や再利用の根拠を提供する。
---

## サマリ
- **機能**: `rename-order-to-cart`
- **調査スコープ**: Extension
- **主要な発見**:
  - Order 名称がドメイン/GraphQL/RMU/ツール/DB スキーマに広く分散している。
  - イベント `typeName` と DB テーブル名の変更が必須であり、データ移行の判断が要点となる。
  - 新規依存関係は不要で、既存スタック内の名称統一で完結する。

## 調査ログ

### コードベース内の Order 依存箇所
- **背景**: 命名統一の影響範囲を把握するため。
- **参照**: `modules/command/domain/src/order/*`, `modules/command/*/order/*`, `modules/query/interface-adaptor/src/graphql/*`, `modules/rmu/src/*`, `modules/bootstrap/src/*`
- **発見**:
  - Order 集約と関連型/イベント/エラーが `modules/command/domain` に集中している。
  - GraphQL の入出力型と Resolver 名が Order 前提である。
  - RMU と Bootstrap が OrderDao/ReadModelUpdater を組み立てている。
- **含意**: 全レイヤで Order を Cart に置換する必要がある。

### データモデルとツール
- **背景**: DB と検証スクリプトの影響を把握するため。
- **参照**: `modules/query/interface-adaptor/prisma/schema.prisma`, `modules/rmu/prisma/schema.prisma`, `tools/migrate/migrations/*.sql`, `tools/e2e-test/verify-order.sh`, `tools/lambda-setup/deploy-lambda.sh`
- **発見**:
  - DB テーブル名が `orders`/`order_items` で固定されている。
  - E2E スクリプトが Order 名の GraphQL API に依存している。
- **含意**: DB/スクリプトも Cart 名へ更新し、必要なら移行手順を設計する。

## アーキテクチャパターン評価

| Option | 概要 | 強み | リスク/制約 | 注記 |
|--------|------|------|------------|------|
| Option A | 既存コンポーネントを in-place で全面リネーム | 命名整合性が最も高い | 変更範囲が広い | 採用方針として確定 | 
| Option C | API は Cart、DB は Order 名を維持 | DB 移行を回避 | 命名不一致が残る | 不採用 | 

## 設計判断

### 判断: Order を Cart に全面リネームする
- **背景**: 要件で公開 API に Order 名を残さないことが明示されている。
- **検討案**:
  1. Option A — in-place の全面リネーム
  2. Option C — DB 名のみ維持
- **採用**: Option A を採用し、ドメイン/GraphQL/RMU/ツール/DB を含めて Order 名を排除する。
- **理由**: 命名の一貫性が最優先であり、破壊的変更が許容されている。
- **トレードオフ**: 変更範囲が広く移行対応が必要。
- **フォローアップ**: イベント型名とテーブル名の移行計画を設計に反映する。

## リスクと緩和策
- 既存イベント/DB データがある場合、型名・テーブル名の不整合が発生する — 明示的な移行手順と検証を設計に含める。
- E2E や運用スクリプトが破損する — スクリプト更新と CI での確認を必須化する。
- 参照資料の Order 表記が残存する — ドキュメント/サンプルを検索し、更新対象を洗い出す。

## 参照
- `.kiro/steering/structure.md` — レイヤ分離と命名規約
- `.kiro/steering/tech.md` — 技術スタックの前提
- `.kiro/specs/rename-order-to-cart/requirements.md` — 要件の根拠
