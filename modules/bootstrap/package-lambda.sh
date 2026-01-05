#!/usr/bin/env bash
set -e

echo "📦 Packaging Lambda function..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LAMBDA_DIR="$SCRIPT_DIR/dist/lambda"
PACKAGE_DIR="$LAMBDA_DIR/package"
ZIP_FILE="$LAMBDA_DIR/function.zip"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# パッケージディレクトリのクリーンアップ
rm -rf "$PACKAGE_DIR"
rm -f "$ZIP_FILE"
mkdir -p "$PACKAGE_DIR"

# ビルドされたLambda関数をコピー
echo "Copying Lambda function..."
cp "$LAMBDA_DIR/index.js" "$PACKAGE_DIR/"
cp "$LAMBDA_DIR/index.js.map" "$PACKAGE_DIR/" 2>/dev/null || true

# Prisma Clientをコピー（pnpm workspace対応 - シンボリックリンクを解決）
echo "Copying Prisma Client..."
mkdir -p "$PACKAGE_DIR/node_modules/@prisma/client"
mkdir -p "$PACKAGE_DIR/node_modules/.prisma/client"

# pnpm workspaceではシンボリックリンクになっているため、-L オプションでリンク先をコピー
PRISMA_CLIENT_PATH=$(realpath "$SCRIPT_DIR/node_modules/@prisma/client" 2>/dev/null || readlink -f "$SCRIPT_DIR/node_modules/@prisma/client")
PRISMA_INTERNAL_PATH=$(dirname "$PRISMA_CLIENT_PATH")/../.prisma/client

cp -rL "$PRISMA_CLIENT_PATH/"* "$PACKAGE_DIR/node_modules/@prisma/client/"
cp -rL "$PRISMA_INTERNAL_PATH/"* "$PACKAGE_DIR/node_modules/.prisma/client/"

# Lambda用のPrismaバイナリを生成（Linux用 - schema.prismaのbinaryTargetsを使用）
echo "Generating Prisma binaries for Lambda (rhel-openssl-1.0.x, rhel-openssl-3.0.x)..."
SCHEMA_PATH="$ROOT_DIR/modules/rmu/prisma/schema.prisma"
if [ -f "$SCHEMA_PATH" ]; then
  cd "$ROOT_DIR/modules/rmu"
  npx prisma generate --schema="$SCHEMA_PATH"
  cd "$SCRIPT_DIR"

  # 生成されたPrismaクライアントをコピー
  RMU_PRISMA_PATH="$ROOT_DIR/modules/rmu/node_modules/.prisma/client"
  if [ -d "$RMU_PRISMA_PATH" ]; then
    echo "Copying Prisma binaries from RMU module..."
    cp -rL "$RMU_PRISMA_PATH/"* "$PACKAGE_DIR/node_modules/.prisma/client/"
  fi
else
  echo "Schema not found at $SCHEMA_PATH, skipping Prisma generate"
fi

# zipパッケージ作成
echo "Creating zip package..."
cd "$PACKAGE_DIR"
zip -r "../function.zip" . -q

echo "✅ Lambda package created: $ZIP_FILE"
echo "Package size: $(du -h "$ZIP_FILE" | cut -f1)"
