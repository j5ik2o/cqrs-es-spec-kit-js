# Lambda Setup Scripts

LocalStack上でRead Model Updater Lambdaをデプロイ・設定するためのスクリプト群。

## スクリプト一覧

### deploy-lambda.sh

Lambda関数をLocalStackにデプロイします。

**機能**:
- Lambda関数が存在しない場合は新規作成
- 既に存在する場合はコードと設定を更新
- 環境変数の設定（DATABASE_URL等）

**環境変数**:
- `AWS_REGION`: AWSリージョン（デフォルト: ap-northeast-1）
- `AWS_ENDPOINT_URL`: LocalStackエンドポイント（デフォルト: http://localstack:4566）
- `LAMBDA_FUNCTION_NAME`: Lambda関数名（デフォルト: read-model-updater）
- `LAMBDA_ZIP_PATH`: Lambda zipファイルのパス（デフォルト: /lambda/function.zip）
- `DATABASE_URL`: MySQLデータベース接続URL

### create-event-mapping.sh

DynamoDB StreamsとLambda関数のEvent Source Mappingを設定します。

**機能**:
- DynamoDB StreamsのARNを自動取得
- Event Source Mappingが存在しない場合は新規作成
- 既に存在する場合は設定を更新

**環境変数**:
- `AWS_REGION`: AWSリージョン（デフォルト: ap-northeast-1）
- `AWS_ENDPOINT_URL`: LocalStackエンドポイント（デフォルト: http://localstack:4566）
- `LAMBDA_FUNCTION_NAME`: Lambda関数名（デフォルト: read-model-updater）
- `STREAM_JOURNAL_TABLE_NAME`: DynamoDBテーブル名（デフォルト: journal）
- `EVENT_BATCH_SIZE`: バッチサイズ（デフォルト: 10）
- `MAX_RETRY_ATTEMPTS`: 最大リトライ回数（デフォルト: 2）

## 使用方法

Docker Compose経由で自動実行されますが、手動実行も可能です。

### 手動実行例

```bash
# Lambda関数のデプロイ
docker exec -it <container-name> /setup/deploy-lambda.sh

# Event Source Mappingの作成
docker exec -it <container-name> /setup/create-event-mapping.sh
```

## 動作確認

### Lambda関数の確認

```bash
awslocal lambda list-functions
awslocal lambda get-function --function-name read-model-updater
```

### Event Source Mappingの確認

```bash
awslocal lambda list-event-source-mappings --function-name read-model-updater
```

### ログの確認

```bash
# CloudWatch Logsの確認
awslocal logs tail /aws/lambda/read-model-updater --follow

# LocalStackのログ
docker logs -f localstack-local
```

## トラブルシューティング

### Lambda関数が見つからない

```bash
# Lambda関数一覧を確認
awslocal lambda list-functions

# 再デプロイ
docker-compose restart lambda-setup
```

### Event Source Mappingが動作しない

```bash
# Mappingの状態を確認
awslocal lambda list-event-source-mappings --function-name read-model-updater

# DynamoDB Streamsが有効か確認
awslocal dynamodb describe-table --table-name journal
```

### Prismaエラー

Lambda内でPrismaのバイナリエラーが発生する場合:
1. `package-lambda.sh`でLinux用バイナリが正しく生成されているか確認
2. Lambda実行環境がNode.js 20であることを確認

## 参考情報

- [LocalStack Lambda Documentation](https://docs.localstack.cloud/user-guide/aws/lambda/)
- [AWS Lambda DynamoDB Streams](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html)
- [Prisma in AWS Lambda](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-aws-lambda)
