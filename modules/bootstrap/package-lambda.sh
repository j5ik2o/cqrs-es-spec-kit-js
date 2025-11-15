#!/bin/bash
set -e

echo "📦 Packaging Lambda function..."

LAMBDA_DIR="dist/lambda"
PACKAGE_DIR="$LAMBDA_DIR/package"
ZIP_FILE="$LAMBDA_DIR/function.zip"

# パッケージディレクトリのクリーンアップ
rm -rf "$PACKAGE_DIR"
rm -f "$ZIP_FILE"
mkdir -p "$PACKAGE_DIR"

# ビルドされたLambda関数をコピー
echo "Copying Lambda function..."
cp "$LAMBDA_DIR/index.js" "$PACKAGE_DIR/"
cp "$LAMBDA_DIR/index.js.map" "$PACKAGE_DIR/" 2>/dev/null || true

# Prisma Clientをコピー
echo "Copying Prisma Client..."
mkdir -p "$PACKAGE_DIR/node_modules/@prisma/client"
mkdir -p "$PACKAGE_DIR/node_modules/.prisma/client"

cp -r node_modules/@prisma/client/* "$PACKAGE_DIR/node_modules/@prisma/client/"
cp -r node_modules/.prisma/client/* "$PACKAGE_DIR/node_modules/.prisma/client/"

# Lambda用のPrismaバイナリを生成（Linux x64用）
echo "Generating Prisma binaries for Linux..."
cd "$PACKAGE_DIR"
PRISMA_CLI_BINARY_TARGETS=rhel-openssl-3.0.x npx prisma generate --schema=../../node_modules/cqrs-es-spec-kit-js-rmu/node_modules/.prisma/client/schema.prisma || true

# zipパッケージ作成
cd "$PACKAGE_DIR"
echo "Creating zip package..."
zip -r "../function.zip" . -q

cd ../../..
echo "✅ Lambda package created: $ZIP_FILE"
echo "Package size: $(du -h "$ZIP_FILE" | cut -f1)"
