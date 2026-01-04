# プロジェクト構造

## 組織方針

ドメイン駆動 + レイヤ分離を採用し、pnpm workspace のモノレポで各モジュールを独立パッケージとして管理する。

## ディレクトリパターン

### コマンド側パッケージ群
**場所**: `modules/command/`  
**目的**: 書き込み系のドメイン/アプリケーション/アダプタを分割する  
**例**: `domain/`, `processor/`, `interface-adaptor-if/`, `interface-adaptor-impl/`

### クエリ側パッケージ
**場所**: `modules/query/`  
**目的**: 読み取り API と DTO/GraphQL スキーマを提供する  
**例**: `interface-adaptor/`

### リードモデル更新
**場所**: `modules/rmu/`  
**目的**: イベントストリームからリードモデルを更新する  
**例**: `update-read-model.ts`

### 共通インフラ
**場所**: `modules/infrastructure/`  
**目的**: イベントストア/DB など基盤の共通実装を置く  
**例**: `src/index.ts`

### 起動/エントリポイント
**場所**: `modules/bootstrap/`  
**目的**: Write/Read API や RMU の起動コードを集約する  
**例**: `write-api-main.ts`, `read-api-main.ts`

## 命名規約

- **ファイル**: kebab-case（例: `cart-item-id.ts`）
- **エクスポート**: パッケージごとに `src/index.ts` で集約する
- **ドメイン型**: `*Id`, `*Name` など値オブジェクト由来の命名を使う

## インポート方針

```typescript
import type { Aggregate } from "event-store-adapter-js";
import { CartId } from "cqrs-es-spec-kit-js-command-domain";
import { CartItems } from "./cart-items";
```

**パスエイリアス**:
- なし（相対パスとパッケージ名を併用）

## コード構成の原則

- Domain は純粋なドメインロジックに限定し、外部依存を最小化する
- Processor/Adaptor は Domain を参照し、逆依存を作らない
- Command/Query/RMU を分離し、責務の交差を避ける

---
updated_at: 2026-01-03
