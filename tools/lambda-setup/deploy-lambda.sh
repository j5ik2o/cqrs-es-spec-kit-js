#!/usr/bin/env bash
set -e

echo "🚀 Deploying Lambda function to LocalStack..."

# 環境変数
AWS_REGION=${AWS_REGION:-ap-northeast-1}
ENDPOINT_URL=${AWS_ENDPOINT_URL:-http://localstack:4566}
FUNCTION_NAME=${LAMBDA_FUNCTION_NAME:-read-model-updater}
HANDLER=${LAMBDA_HANDLER:-index.handler}
RUNTIME=${LAMBDA_RUNTIME:-nodejs20.x}
TIMEOUT=${LAMBDA_TIMEOUT:-60}
MEMORY_SIZE=${LAMBDA_MEMORY_SIZE:-512}
ROLE_ARN="arn:aws:iam::000000000000:role/lambda-role"

# 環境変数（Lambda内で使用）
DATABASE_URL=${DATABASE_URL:-mysql://orderdb:orderdb@mysql-local:3306/orderdb}

LAMBDA_ZIP_PATH=${LAMBDA_ZIP_PATH:-/lambda/function.zip}

echo "Configuration:"
echo "  Function Name: $FUNCTION_NAME"
echo "  Handler: $HANDLER"
echo "  Runtime: $RUNTIME"
echo "  Timeout: $TIMEOUT"
echo "  Memory: $MEMORY_SIZE MB"
echo "  Zip Path: $LAMBDA_ZIP_PATH"
echo "  Database URL: $DATABASE_URL"

# Lambda関数が存在するか確認
FUNCTION_EXISTS=$(aws lambda get-function \
  --function-name "$FUNCTION_NAME" \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$AWS_REGION" \
  2>/dev/null || echo "")

if [ -z "$FUNCTION_EXISTS" ]; then
  echo "Creating new Lambda function..."
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime "$RUNTIME" \
    --handler "$HANDLER" \
    --role "$ROLE_ARN" \
    --zip-file "fileb://$LAMBDA_ZIP_PATH" \
    --timeout "$TIMEOUT" \
    --memory-size "$MEMORY_SIZE" \
    --environment "Variables={DATABASE_URL=$DATABASE_URL}" \
    --endpoint-url "$ENDPOINT_URL" \
    --region "$AWS_REGION"

  echo "✅ Lambda function created successfully"
else
  echo "Updating existing Lambda function code..."
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$LAMBDA_ZIP_PATH" \
    --endpoint-url "$ENDPOINT_URL" \
    --region "$AWS_REGION"

  echo "Updating function configuration..."
  aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --timeout "$TIMEOUT" \
    --memory-size "$MEMORY_SIZE" \
    --environment "Variables={DATABASE_URL=$DATABASE_URL}" \
    --endpoint-url "$ENDPOINT_URL" \
    --region "$AWS_REGION"

  echo "✅ Lambda function updated successfully"
fi

echo "🎉 Lambda deployment completed"
