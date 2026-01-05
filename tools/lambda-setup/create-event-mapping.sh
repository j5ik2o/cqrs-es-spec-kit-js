#!/usr/bin/env bash
set -e

echo "🔗 Creating DynamoDB Streams Event Source Mapping..."

# 環境変数
AWS_REGION=${AWS_REGION:-ap-northeast-1}
ENDPOINT_URL=${AWS_ENDPOINT_URL:-http://localstack:4566}
FUNCTION_NAME=${LAMBDA_FUNCTION_NAME:-read-model-updater}
TABLE_NAME=${STREAM_JOURNAL_TABLE_NAME:-journal}
BATCH_SIZE=${EVENT_BATCH_SIZE:-10}
MAX_RETRY_ATTEMPTS=${MAX_RETRY_ATTEMPTS:-2}

echo "Configuration:"
echo "  Function Name: $FUNCTION_NAME"
echo "  Table Name: $TABLE_NAME"
echo "  Batch Size: $BATCH_SIZE"
echo "  Max Retry Attempts: $MAX_RETRY_ATTEMPTS"

# DynamoDB StreamのARNを取得（リトライ付き）
echo "Getting DynamoDB Stream ARN..."
MAX_RETRIES=${STREAM_WAIT_RETRIES:-5}
RETRY_INTERVAL=${STREAM_WAIT_INTERVAL:-2}

for i in $(seq 1 $MAX_RETRIES); do
  STREAM_ARN=$(aws dynamodb describe-table \
    --table-name "$TABLE_NAME" \
    --endpoint-url "$ENDPOINT_URL" \
    --region "$AWS_REGION" \
    --query 'Table.LatestStreamArn' \
    --output text 2>/dev/null || echo "")

  if [ -n "$STREAM_ARN" ] && [ "$STREAM_ARN" != "None" ]; then
    break
  fi
  echo "Waiting for DynamoDB Stream... (attempt $i/$MAX_RETRIES)"
  sleep "$RETRY_INTERVAL"
done

if [ -z "$STREAM_ARN" ] || [ "$STREAM_ARN" = "None" ]; then
  echo "❌ Error: DynamoDB Stream ARN not found for table $TABLE_NAME"
  echo "Make sure the table has streams enabled"
  exit 1
fi

echo "  Stream ARN: $STREAM_ARN"

# 既存のEvent Source Mappingを確認
echo "Checking for existing event source mappings..."
EXISTING_MAPPING=$(aws lambda list-event-source-mappings \
  --function-name "$FUNCTION_NAME" \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$AWS_REGION" \
  --query "EventSourceMappings[?EventSourceArn=='$STREAM_ARN'].UUID" \
  --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_MAPPING" ]; then
  echo "Event source mapping already exists: $EXISTING_MAPPING"
  echo "Updating existing mapping..."

  aws lambda update-event-source-mapping \
    --uuid "$EXISTING_MAPPING" \
    --batch-size "$BATCH_SIZE" \
    --maximum-retry-attempts "$MAX_RETRY_ATTEMPTS" \
    --endpoint-url "$ENDPOINT_URL" \
    --region "$AWS_REGION"

  echo "✅ Event source mapping updated successfully"
else
  echo "Creating new event source mapping..."

  aws lambda create-event-source-mapping \
    --function-name "$FUNCTION_NAME" \
    --event-source-arn "$STREAM_ARN" \
    --starting-position LATEST \
    --batch-size "$BATCH_SIZE" \
    --maximum-retry-attempts "$MAX_RETRY_ATTEMPTS" \
    --endpoint-url "$ENDPOINT_URL" \
    --region "$AWS_REGION"

  echo "✅ Event source mapping created successfully"
fi

echo "🎉 Event source mapping configuration completed"
