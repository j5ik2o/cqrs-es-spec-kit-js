FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl3

RUN corepack disable
RUN rm -f /usr/local/bin/pnpm /usr/local/bin/yarn /usr/local/bin/pnpm.js /usr/local/bin/yarn.js
RUN npm install -g --force pnpm@9
RUN which pnpm && pnpm --version

FROM base AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache libc6-compat zip
WORKDIR /app

COPY . /app

RUN pnpm install -g turbo
RUN pnpm install
RUN pnpm prisma:generate
RUN pnpm build

# Build Lambda function
RUN cd modules/bootstrap && pnpm build:lambda

# Package Lambda function with proper Prisma client (optimized for size)
RUN cd modules/bootstrap && \
    mkdir -p dist/lambda/package/node_modules/@prisma && \
    mkdir -p dist/lambda/package/node_modules/.prisma && \
    cp dist/lambda/index.js dist/lambda/package/ && \
    # Find the actual Prisma client location in pnpm hoisted modules
    PRISMA_HOISTED=$(find /app/node_modules/.pnpm -name "@prisma+client*" -type d | head -1) && \
    echo "Prisma hoisted location: $PRISMA_HOISTED" && \
    cp -rL "$PRISMA_HOISTED/node_modules/@prisma/client" dist/lambda/package/node_modules/@prisma/ && \
    # Copy .prisma/client with generated files
    PRISMA_INTERNAL=$(find /app/node_modules/.pnpm -path "*/.prisma/client" -type d | head -1) && \
    echo "Prisma internal location: $PRISMA_INTERNAL" && \
    cp -rL "$PRISMA_INTERNAL" dist/lambda/package/node_modules/.prisma/ && \
    # Remove unnecessary Prisma binaries to reduce package size (keep only rhel-openssl-1.0.x for Lambda)
    echo "Removing unnecessary Prisma binaries..." && \
    find dist/lambda/package -name "libquery_engine-*" ! -name "*rhel-openssl-1.0.x*" -delete && \
    find dist/lambda/package -name "schema-engine-*" -delete && \
    find dist/lambda/package -name "introspection-engine-*" -delete && \
    find dist/lambda/package -name "migration-engine-*" -delete && \
    find dist/lambda/package -name "prisma-fmt-*" -delete && \
    find dist/lambda/package -name "*.node" ! -name "*rhel*" -delete 2>/dev/null || true && \
    # List remaining binaries for verification
    echo "Remaining Prisma binaries:" && \
    find dist/lambda/package -name "libquery_engine-*" -o -name "*.node" 2>/dev/null | head -10 && \
    cd dist/lambda/package && \
    zip -r ../function.zip . -q && \
    echo "Package size:" && du -h ../function.zip

FROM base AS runner
WORKDIR /app/modules/bootstrap

RUN apk add --no-cache libc6-compat
RUN apk add --no-cache openssl3
RUN apk update

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json /app/package.json

COPY --from=builder --chown=nodejs:nodejs /app/modules/bootstrap/node_modules /app/modules/bootstrap/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/modules/bootstrap/dist /app/modules/bootstrap/dist
COPY --from=builder --chown=nodejs:nodejs /app/modules/bootstrap/package.json /app/modules/bootstrap/package.json

COPY --from=builder --chown=nodejs:nodejs /app/modules/command/domain/node_modules /app/modules/command/domain/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/modules/command/domain/dist /app/modules/command/domain/dist
COPY --from=builder --chown=nodejs:nodejs /app/modules/command/domain/package.json /app/modules/command/domain/package.json

COPY --from=builder --chown=nodejs:nodejs /app/modules/command/interface-adaptor-if/node_modules /app/modules/command/interface-adaptor-if/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/modules/command/interface-adaptor-if/dist /app/modules/command/interface-adaptor-if/dist
COPY --from=builder --chown=nodejs:nodejs /app/modules/command/interface-adaptor-if/package.json /app/modules/command/interface-adaptor-if/package.json

COPY --from=builder --chown=nodejs:nodejs /app/modules/command/interface-adaptor-impl/node_modules /app/modules/command/interface-adaptor-impl/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/modules/command/interface-adaptor-impl/dist /app/modules/command/interface-adaptor-impl/dist
COPY --from=builder --chown=nodejs:nodejs /app/modules/command/interface-adaptor-impl/package.json /app/modules/command/interface-adaptor-impl/package.json

COPY --from=builder --chown=nodejs:nodejs /app/modules/command/processor/node_modules /app/modules/command/processor/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/modules/command/processor/dist /app/modules/command/processor/dist
COPY --from=builder --chown=nodejs:nodejs /app/modules/command/processor/package.json /app/modules/command/processor/package.json

COPY --from=builder --chown=nodejs:nodejs /app/modules/rmu/node_modules /app/modules/rmu/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/modules/rmu/dist /app/modules/rmu/dist
COPY --from=builder --chown=nodejs:nodejs /app/modules/rmu/prisma /app/modules/rmu/prisma
COPY --from=builder --chown=nodejs:nodejs /app/modules/rmu/package.json /app/modules/rmu/package.json

COPY --from=builder --chown=nodejs:nodejs /app/modules/query/interface-adaptor/node_modules /app/modules/query/interface-adaptor/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/modules/query/interface-adaptor/dist /app/modules/query/interface-adaptor/dist
COPY --from=builder --chown=nodejs:nodejs /app/modules/query/interface-adaptor/prisma /app/modules/query/interface-adaptor/prisma
COPY --from=builder --chown=nodejs:nodejs /app/modules/query/interface-adaptor/package.json /app/modules/query/interface-adaptor/package.json

COPY --from=builder --chown=nodejs:nodejs /app/modules/infrastructure/node_modules /app/modules/infrastructure/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/modules/infrastructure/dist /app/modules/infrastructure/dist
COPY --from=builder --chown=nodejs:nodejs /app/modules/infrastructure/package.json /app/modules/infrastructure/package.json

# Copy Lambda function zip for LocalStack deployment
COPY --from=builder --chown=nodejs:nodejs /app/modules/bootstrap/dist/lambda /app/modules/bootstrap/dist/lambda

# Regenerate Prisma client in runner stage to fix paths
RUN cd /app/modules/rmu && pnpm prisma generate
RUN cd /app/modules/query/interface-adaptor && pnpm prisma generate

USER nodejs
EXPOSE 3000

ENTRYPOINT ["node", "./dist/index.js"]
