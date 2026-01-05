#!/usr/bin/env bash
set -e

echo "🚀 Deploying Lambda function to LocalStack..."

# 環境変数
AWS_REGION=${AWS_REGION:-ap-northeast-1}
ENDPOINT_URL=${AWS_ENDPOINT_URL:-http://localstack:4566}
FUNCTION_NAME=${LAMBDA_FUNCTION_NAME:-read-model-updater}
HANDLER=${LAMBDA_HANDLER:-index.handler}
RUNTIME=${LAMBDA_RUNTIME:-nodejs18.x}
TIMEOUT=${LAMBDA_TIMEOUT:-60}
MEMORY_SIZE=${LAMBDA_MEMORY_SIZE:-512}
ROLE_ARN="arn:aws:iam::000000000000:role/lambda-role"

# 環境変数（Lambda内で使用）
DATABASE_URL=${DATABASE_URL:-mysql://cartdb:cartdb@mysql-local:3306/cartdb}

LAMBDA_ZIP_PATH=${LAMBDA_ZIP_PATH:-/app/modules/bootstrap/dist/lambda/function.zip}
S3_BUCKET=${LAMBDA_S3_BUCKET:-lambda-code}
S3_KEY=${LAMBDA_S3_KEY:-function.zip}
USE_S3=${LAMBDA_USE_S3:-true}

echo "Configuration:"
echo "  Function Name: $FUNCTION_NAME"
echo "  Handler: $HANDLER"
echo "  Runtime: $RUNTIME"
echo "  Timeout: $TIMEOUT"
echo "  Memory: $MEMORY_SIZE MB"
echo "  Zip Path: $LAMBDA_ZIP_PATH"
echo "  Use S3: $USE_S3"

# S3経由でデプロイ（大きなファイル対応）
if [ "$USE_S3" = "true" ]; then
  echo "Creating S3 bucket for Lambda code..."
  aws s3 mb "s3://$S3_BUCKET" --endpoint-url "$ENDPOINT_URL" --region "$AWS_REGION" 2>/dev/null || true

  echo "Uploading Lambda package to S3..."
  AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED \
  aws s3 cp "$LAMBDA_ZIP_PATH" "s3://$S3_BUCKET/$S3_KEY" \
    --endpoint-url "$ENDPOINT_URL" \
    --region "$AWS_REGION" \
    --no-progress

  CODE_ARG="S3Bucket=$S3_BUCKET,S3Key=$S3_KEY"
  UPDATE_CODE_ARG="--s3-bucket $S3_BUCKET --s3-key $S3_KEY"
else
  CODE_ARG=""
  UPDATE_CODE_ARG="--zip-file fileb://$LAMBDA_ZIP_PATH"
fi

# Lambda関数が存在するか確認
FUNCTION_EXISTS=$(aws lambda get-function \
  --function-name "$FUNCTION_NAME" \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$AWS_REGION" \
  2>/dev/null || echo "")

if [ -z "$FUNCTION_EXISTS" ]; then
  echo "Creating new Lambda function..."
  if [ "$USE_S3" = "true" ]; then
    aws lambda create-function \
      --function-name "$FUNCTION_NAME" \
      --runtime "$RUNTIME" \
      --handler "$HANDLER" \
      --role "$ROLE_ARN" \
      --code "$CODE_ARG" \
      --timeout "$TIMEOUT" \
      --memory-size "$MEMORY_SIZE" \
      --environment "Variables={DATABASE_URL=$DATABASE_URL}" \
      --endpoint-url "$ENDPOINT_URL" \
      --region "$AWS_REGION"
  else
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
  fi
  echo "✅ Lambda function created successfully"
else
  echo "Updating existing Lambda function code..."
  # shellcheck disable=SC2086
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    $UPDATE_CODE_ARG \
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
