# Cart RMU LocalStack Capability

## ADDED Requirements

### Requirement: LocalStack DynamoDB Streamsからのイベント読み取り
RMUはLocalStackで起動したDynamoDB Streamsからイベントを読み取れなければならない（MUST）。

#### Scenario: DynamoDB Streamsイベント受信
**Given**:
- LocalStackのDynamoDB Streamsが起動している
- CartCreatedイベントがDynamoDBに書き込まれる

**When**:
- RMUがDynamoDB Streamsをポーリングする

**Then**:
- CartCreatedイベントが正しく受信される
- イベントペイロードがパースされる
- イベントハンドラが呼び出される

---

### Requirement: CartCreatedイベントのRead Model投影
CartCreatedイベントを受信したらRead Modelに反映しなければならない（MUST）。

#### Scenario: 正常なカート作成イベントの投影
**Given**:
- CartCreatedイベントが受信される
- イベントには cartId, name, executorId が含まれる

**When**:
- CartCreatedイベントハンドラが実行される

**Then**:
- PrismaClientを通じてCartテーブルに新しいレコードが挿入される
- レコードにはid, name, createdAtが正しく設定される
- deleted フラグは false である

---

### Requirement: CartItemAddedイベントのRead Model投影
CartItemAddedイベントを受信したらRead Modelに反映しなければならない（MUST）。

#### Scenario: 正常なアイテム追加イベントの投影
**Given**:
- CartItemAddedイベントが受信される
- イベントには cartId, itemId, name, quantity, price が含まれる
- 対応するCartレコードがRead Modelに存在する

**When**:
- CartItemAddedイベントハンドラが実行される

**Then**:
- PrismaClientを通じてCartItemテーブルに新しいレコードが挿入される
- レコードにはcartId, itemId, name, quantity, priceが正しく設定される
- CartテーブルのupdatedAtが更新される

---

### Requirement: CartDeletedイベントのRead Model投影
CartDeletedイベントを受信したらRead Modelに反映しなければならない（MUST）。

#### Scenario: 正常なカート削除イベントの投影
**Given**:
- CartDeletedイベントが受信される
- 対応するCartレコードがRead Modelに存在する

**When**:
- CartDeletedイベントハンドラが実行される

**Then**:
- PrismaClientを通じてCartレコードのdeleted フラグがtrueに更新される
- updatedAtが更新される

---

### Requirement: LocalStack環境でのエンドツーエンド動作
LocalStack環境で全体フローが動作しなければならない（MUST）。

#### Scenario: LocalStackでのCQRSフロー
**Given**:
- LocalStackでDynamoDB, DynamoDB Streamsが起動している
- Write APIサーバーが起動している
- RMUがLocalStackに接続している
- Read APIサーバーが起動している

**When**:
1. GraphQL MutationでCartを作成
2. RMUがDynamoDB StreamsからCartCreatedイベントを受信
3. RMUがRead Modelを更新
4. GraphQL QueryでCartを取得

**Then**:
- Queryで作成したCartが正しく取得できる
- Cartの情報が一致する
- 全プロセスが5秒以内に完了する（最終的整合性）

---

### Requirement: エラー時のリトライ機能
イベント処理に失敗した場合、リトライできなければならない（MUST）。

#### Scenario: 一時的な障害時のリトライ
**Given**:
- DynamoDB Streamsからイベントを受信
- PrismaClientの接続が一時的に失敗する

**When**:
- イベントハンドラが実行され、エラーが発生する

**Then**:
- エラーログが出力される
- イベント処理が3回リトライされる
- 3回失敗後、DeadLetterキューに移動される（または記録される）

---

### Requirement: LocalStack接続設定
RMUはLocalStackのエンドポイントに接続できなければならない（MUST）。

#### Scenario: LocalStack エンドポイント接続
**Given**:
- 環境変数 `AWS_ENDPOINT_URL=http://localhost:4566` が設定されている
- 環境変数 `AWS_REGION=us-east-1` が設定されている

**When**:
- RMUが起動する

**Then**:
- DynamoDB クライアントがLocalStackエンドポイントに接続される
- DynamoDB Streams クライアントがLocalStackエンドポイントに接続される
- 接続成功のログが出力される
