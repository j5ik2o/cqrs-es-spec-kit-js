# CQRS / ES Spec Kit for TypeScript

このリポジトリは、DDD（Domain-Driven Design）、CQRS（Command Query Responsibility Segregation）、Event Sourcing を実践するための仕様駆動テンプレートです。大きな粒度の初期立ち上げやモジュール単位の機能追加では GitHub Spec Kit を活用し、保守や小規模対応では OpenSpec を用いてスコープを明示しながらタスクを進めます。これにより、AI 支援で頻発するコンテキスト溢れやゴールポストのずれを抑止し、仕様と実装の整合性を保ちます。

## 主な特徴
- GitHub Spec Kit を用いた大規模ブートストラップ：最初期の土台作りやモジュール単位の大きな追加を体系的に管理。
- OpenSpec による要求管理：`openspec/project.md` と `openspec/specs/` を中心に、保守系タスクのスコープを明確化しながら要件・シナリオを文書化。
- DDD/CQRS/ES 向けのベストプラクティス：アグリゲート、コマンド、イベント、リードモデルの設計指針を整理。
- TypeScript/Node.js ベース：厳格な型安全性とモジュール構成を前提にしたテンプレート。
- 拡張用リファレンス：`references/` ディレクトリで各種サンプルリポジトリを参照可能。
- AWS 運用と LocalStack 検証：本番・ステージングは AWS を前提とし、ローカル検証は docker compose + LocalStack で AWS サービスを再現するガイドラインを提供。
- GraphQL × Next.js アーキテクチャ：GraphQL サーバにドメインロジックを集約し、Next.js API Routes を BFF、Next.js をプレゼンテーション層として役割分担する標準構成を提示。

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
- Docker Compose
- LocalStack（ローカルで AWS サービスを再現するため）

### 推奨ツール
- Docker と Docker Compose（イベントストアや補助サービスをローカルで起動する場合）
- OpenSpec CLI (`openspec` コマンド)
- LocalStack CLI（`localstack`）と AWS CLI（LocalStack / AWS 双方の検証に利用）

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
- 本番・ステージング・QA は AWS を標準基盤とし、イベントバスには Amazon Kinesis Data Streams を利用する。GraphQL サブスクリプション経由でドメインイベントをクライアントへ配信する設計を前提とする。  
- ローカル/CI の動作確認は `docker compose` + LocalStack で AWS サービスを再現し、イベント配信と GraphQL サブスクリプションの再生テストを自動化する。  
- ドメインモデル・ユースケースは GraphQL サーバ（例: Apollo Server）に集約し、Mutation/Query/Subscription がユースケースと 1:1 に対応するよう実装する。  
- Next.js API Routes は BFF として GraphQL サーバへの通信・入力検証・セッション管理・レスポンス整形を担い、Next.js UI は BFF を介してデータ取得/更新・リアルタイム更新を行う。  

## クラウド運用とローカル検証
- `docker compose up` で LocalStack を起動し、Kinesis・Secrets Manager・その他必要な AWS サービスをエミュレートする。  
- IaC（AWS CDK / CloudFormation / Terraform のいずれか）で AWS リソース構成をコード化し、環境差異を pull request レベルで追跡する。  
- GraphQL ミューテーションはコマンド実行、クエリは読み取りモデル参照、サブスクリプションは Kinesis ストリームのイベントを配信する構成を想定する。  
- ローカルから AWS へ切り替える際は、環境変数でエンドポイント・認証情報をスイッチし、LocalStack 用設定を README と各 spec/plan に明記する。  
- CI では LocalStack を使った統合テストを必須とし、Kinesis ストリームの再生と GraphQL サブスクリプションの受信を確認する。

## 参考リポジトリ
- `references/cqrs-es-example-js`：基本的な CQRS/ES 実装例。  
- `references/event-store-adapter-js`：イベントストアのアダプタ実装例。  

必要に応じて各リファレンスを参照しながら、本テンプレートに合わせてアプリケーションを設計してください。大規模な設計変更や初期立ち上げは GitHub Spec Kit、既存機能の改修やバグ修正は OpenSpec で扱うことで、スコープのブレとコンテキスト不足を防ぎます。

## ライセンス
このテンプレートは ISC ライセンスの下で提供されます。詳細は `package.json` を参照してください。
