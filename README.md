# CQRS / ES Spec Kit for TypeScript

このリポジトリは、DDD（Domain-Driven Design）、CQRS（Command Query Responsibility Segregation）、Event Sourcing を実践するための仕様駆動テンプレートです。大きな粒度の初期立ち上げやモジュール単位の機能追加では GitHub Spec Kit を活用し、保守や小規模対応では OpenSpec を用いてスコープを明示しながらタスクを進めます。これにより、AI 支援で頻発するコンテキスト溢れやゴールポストのずれを抑止し、仕様と実装の整合性を保ちます。

## 主な特徴
- GitHub Spec Kit を用いた大規模ブートストラップ：最初期の土台作りやモジュール単位の大きな追加を体系的に管理。
- OpenSpec による要求管理：`openspec/project.md` と `openspec/specs/` を中心に、保守系タスクのスコープを明確化しながら要件・シナリオを文書化。
- DDD/CQRS/ES 向けのベストプラクティス：アグリゲート、コマンド、イベント、リードモデルの設計指針を整理。
- TypeScript/Node.js ベース：厳格な型安全性とモジュール構成を前提にしたテンプレート。
- 拡張用リファレンス：`references/` ディレクトリで各種サンプルリポジトリを参照可能。

## ディレクトリ構成
```
.
├── openspec/          # OpenSpec 定義ファイル群
│   ├── project.md     # プロジェクト全体のコンテキスト
│   ├── specs/         # 確定済み仕様（初期状態では空）
│   └── changes/       # 進行中の変更提案（デフォルトでは空）
├── references/        # 関連するサンプル・外部リポジトリへのリンク
├── scripts/           # AI エージェント実行用スクリプト
├── package.json       # Node.js / TypeScript 設定の起点
├── README.md          # このファイル
└── .github/spec-kit/  # GitHub Spec Kit 用の設定（必要に応じて追加）
```

## 前提環境
- Node.js 20 以上
- npm 9 以上（または pnpm / yarn でも可）
- Git CLI

### 推奨ツール
- Docker と Docker Compose（イベントストアや補助サービスをローカルで起動する場合）
- OpenSpec CLI (`openspec` コマンド)

## セットアップ
```bash
git clone <このリポジトリのURL>
cd cqrs-es-spec-kit-js
npm install
```

OpenSpec CLI をまだ導入していない場合は、グローバルまたは任意の方法でインストールしてください。

```bash
npm install -g openspec
# もしくは
pnpm add -g openspec
```

## ワークフロー全体像

### GitHub Spec Kit（大規模変更・初期構築向け）
1. **Change Blueprint の作成**：GitHub Spec Kit のテンプレートに従って、機能単位の要求、非機能要件、成果物を定義する。  
2. **レビューと合意形成**：関係者レビューを通じて大まかなスコープとマイルストーンを確定する。  
3. **実装フェーズ**：決定した設計方針に沿ってコードを整備し、完了後に GitHub Spec Kit の成果物を更新する。  

### OpenSpec（保守・小規模タスク向け）
1. **コンテキスト把握**：`openspec/project.md` を読み、前提・制約・規約を理解する。  
2. **既存仕様の確認**：`openspec list --specs` や `openspec show <spec-id>` で既存の能力を確認。  
3. **変更提案の作成**：新しい機能や仕様変更が必要な場合は `openspec/changes/<change-id>/` に proposal を作成し、`openspec validate <change-id> --strict` で検証。  
4. **実装**：提案が承認されたら、`tasks.md` の TODO を完了させながらコードを実装する。  
5. **アーカイブ**：デプロイ完了後は `openspec archive <change-id>` で変更をアーカイブし、`specs/` を最新化する。

## 実装の指針
- アグリゲートは不変条件を守るロジックのみ保持し、副作用や外部呼び出しはハンドラ側に寄せる。  
- コマンドハンドラでは、リポジトリを通じてアグリゲートを再構築し、新しいドメインイベントを生成して永続化する。  
- 読み取りモデルはイベントハンドラで更新し、最終的整合性を前提に API へ提供する。  
- プロセスマネージャ（サガ）は外部システムとの協調や補償処理を担当し、タイムアウト・リトライを明示的に扱う。  
- テストは Given/When/Then 形式で仕様を直接表現し、`npm test` で統合する。  

## 参考リポジトリ
- `references/cqrs-es-example-js`：基本的な CQRS/ES 実装例。  
- `references/event-store-adapter-js`：イベントストアのアダプタ実装例。  

必要に応じて各リファレンスを参照しながら、本テンプレートに合わせてアプリケーションを設計してください。大規模な設計変更や初期立ち上げは GitHub Spec Kit、既存機能の改修やバグ修正は OpenSpec で扱うことで、スコープのブレとコンテキスト不足を防ぎます。

## ライセンス
このテンプレートは ISC ライセンスの下で提供されます。詳細は `package.json` を参照してください。
