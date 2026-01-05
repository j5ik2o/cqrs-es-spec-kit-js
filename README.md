# cqrs-es-spec-kit-js

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**AI-Driven Specification Kit for CQRS/Event Sourcing with DDD and GraphQL**

A comprehensive template repository that combines Domain-Driven Design (DDD), CQRS/Event Sourcing patterns, and GraphQL with AI-powered specification-driven development workflows.

[Japanese](./README.ja.md)

---

## Overview

`cqrs-es-spec-kit-js` provides a production-ready foundation for building scalable event-sourced systems using:

- **Domain-Driven Design (DDD)**: Tactical patterns for aggregate modeling and bounded contexts
- **CQRS/Event Sourcing**: Complete separation of write and read models with event-driven architecture
- **GraphQL**: Type-safe API layer for both commands (mutations) and queries
- **AI-Driven Specification**: Kiro-style workflow leveraging AI tools (Codex, Claude Code, Cursor Agent, Gemini) for systematic feature development

This template is designed for **developers who understand DDD/CQRS/ES fundamentals** and are seeking proven implementation patterns and AI-assisted development workflows.

It provides a foundation that allows domain events, commands, aggregates, and query models derived from Event Storming domain analysis to be naturally implemented through CQRS/Event Sourcing architecture. This maintains consistency between analysis and implementation, which is difficult to achieve with traditional CRUD-based approaches.

---

## Features

### Core Architecture
- ✅ **Event Store Foundation**: Built on [event-store-adapter-js](https://github.com/j5ik2o/event-store-adapter-js) with DynamoDB backend
- ✅ **CQRS Implementation**: Separated write and read models with GraphQL API
- ✅ **Read Model Updater**: Event-driven projection builder for query-side optimization
- ✅ **Reference Implementation**: Production-grade example from [cqrs-es-example-js](https://github.com/j5ik2o/cqrs-es-example-js)

### AI-Powered Development
- ✅ **Kiro Workflow**: Structured specification → design → implementation phases
- ✅ **Multi-AI Support**: Works with Codex, Claude Code, Cursor Agent, Gemini
- ✅ **Project Memory**: `.kiro/steering/` for persistent architectural decisions
- ✅ **Spec-Driven**: `.kiro/specs/` for feature-level development tracking

### Development Tools
- ✅ **Docker Compose**: Complete local development environment
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **GraphQL Tooling**: Apollo Server with TypeGraphQL decorators
- ✅ **ORM Integration**: Prisma for read model persistence

---

## Quick Start

### Prerequisites

#### Required

| Tool | Description |
|------|-------------|
| **Nix** | Package manager with flakes enabled ([Install](https://nix.dev/install-nix)) |
| **Docker** | Container runtime |
| **Git** | Version control |

Please refer to the setup guides:
- [Nix setup](docs/NIX_SETUP.md)
- [direnv setup](docs/DIRENV_SETUP.md)

#### Supported OS

- macOS / Linux: works as-is
- Windows: run under WSL2 (Ubuntu, etc.) and enable Docker Desktop WSL integration
- All commands are expected to be executed from the WSL shell

#### Knowledge Prerequisites

- Basic understanding of DDD, CQRS/ES, and GraphQL
- AI Coding Tool: Codex, Claude Code, Cursor Agent, Gemini

### Installation

1. **Install Nix** (if not already installed):
   ```bash
   # Follow instructions at https://nix.dev/install-nix
   curl -L https://nixos.org/nix/install | sh

   # Enable flakes (add to ~/.config/nix/nix.conf)
   echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
   ```

2. **Clone and enter development environment**:
   ```bash
   git clone --recursive https://github.com/j5ik2o/cqrs-es-spec-kit-js.git
   cd cqrs-es-spec-kit-js

   # Enter development environment (includes Node.js, pnpm, Docker tools, AWS CLI, jq, curl)
   nix develop
   # or
   # direnv allow

   # Install dependencies
   pnpm install
   ```

3. **Explore reference implementations** (for AI code reading):
   ```bash
   # The references/ directory contains example code for AI tools to reference
   # These are NOT used as runtime dependencies

   # Check the complete working example
   cd references/cqrs-es-example-js

   # Review event store adapter implementation patterns
   cd references/event-store-adapter-js
   ```

---

## Example Implementation: Cart Domain

This repository includes a complete **Cart domain** implementation demonstrating the full CQRS/ES stack:

### Domain Model

**Aggregate Root**: `Cart` (modules/command/domain/src/cart/)
- Value Objects: `CartId`, `CartName`
- Entity: `CartItem` with `CartItemId`, `Quantity`, `Price`
- Domain Events: `CartCreated`, `CartItemAdded`, `CartItemRemoved`, `CartDeleted`

**Key Features**:
- Event sourcing with `replay()` and `applyEvent()` methods
- Immutable command methods returning `[newState, event]` tuples
- Snapshot optimization via `CartRepositoryImpl` (every 100 events)

### Module Structure

```
modules/
├── command/
│   ├── domain/                      # Cart aggregate and events
│   ├── interface-adaptor-if/        # CartRepository interface
│   ├── interface-adaptor-impl/      # EventStore integration
│   └── processor/                   # CartCommandProcessor
├── query/
│   └── interface-adaptor/           # GraphQL query resolvers
├── rmu/
│   └── src/                         # Read model updater (Prisma)
├── infrastructure/                  # Shared infrastructure utilities
└── bootstrap/
    └── src/
        ├── write-api-main.ts        # Command API server
        ├── read-api-main.ts         # Query API server
        ├── local-rmu-main.ts        # Local RMU (for development)
        └── lambda-rmu-handler.ts    # Lambda-based RMU (for Docker/production)
```

### Running the Example

#### Option 1: Using Docker (Recommended)

1. **Build Docker image**:
   ```bash
   ./tools/docker/docker-build.sh
   ```

2. **Start all services**:
   ```bash
   ./tools/docker/docker-up.sh
   ```

3. **Run E2E tests**:
   ```bash
   ./tools/e2e-test/verify-cart.sh
   ```

4. **View logs**:
   ```bash
   ./tools/docker/docker-logs.sh
   ```

5. **Stop all services**:
   ```bash
   ./tools/docker/docker-down.sh
   ```

**Services Available**:
- Write API: http://localhost:38080
- Read API: http://localhost:38082
- Read Model Updater: Lambda-based (runs automatically via DynamoDB Streams)
- DynamoDB Admin: http://localhost:38003
- phpMyAdmin: http://localhost:24040

#### Option 2: Running Locally

1. **Start infrastructure**:
   ```bash
   docker-compose up -d mysql localstack dynamodb-setup dynamodb-admin phpmyadmin migration lambda-setup
   ```

2. **Build and start servers**:
   ```bash
   pnpm install
   pnpm build

   # Terminal 1: Write API (port 38080)
   node modules/bootstrap/dist/index.js writeApi

   # Terminal 2: Read API (port 38082)
   node modules/bootstrap/dist/index.js readApi

   # Note: Read Model Updater runs as Lambda function triggered by DynamoDB Streams
   # (started via lambda-setup in docker-compose)
   ```

3. **Run E2E tests**:
   ```bash
   ./tools/e2e-test/verify-cart.sh
   ```

### Available pnpm Scripts

The project provides convenient pnpm scripts for common development tasks:

#### Docker Development Environment
```bash
pnpm docker-build     # Build Docker image
pnpm docker-up        # Start all services
pnpm docker-down      # Stop all services
pnpm docker-logs      # View service logs
```

#### AI Development Tools
```bash
pnpm codex            # Launch Codex
pnpm claude           # Launch Claude Code
pnpm cursor           # Launch Cursor Agent
pnpm gemini           # Launch Gemini
```

#### Testing
```bash
pnpm verify-cart     # Run E2E tests for Cart domain
pnpm test             # Run unit tests
```

#### Build & Quality
```bash
pnpm build            # Build all packages
pnpm lint             # Run linter
pnpm format           # Check code formatting
pnpm clean            # Remove build artifacts
```

#### Database
```bash
pnpm prisma:generate  # Generate Prisma Client
```

### GraphQL API Examples

**Create Cart**:
```graphql
mutation {
  createCart(input: {
    name: "Sample Cart"
    executorId: "UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
  }) {
    cartId
  }
}
```

**Add Item**:
```graphql
mutation {
  addItemToCart(input: {
    cartId: "Cart-01234567890"
    name: "Product A"
    quantity: 2
    price: 1000
    executorId: "UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
  }) {
    cartId
    itemId
  }
}
```

**Query Cart**:
```graphql
query {
  getCart(cartId: "Cart-01234567890") {
    id
    name
    deleted
    createdAt
    updatedAt
  }
}
```

### Learning from the Example

This implementation demonstrates:
- ✅ Event-sourced aggregate with replay mechanism
- ✅ EventStore integration with DynamoDB backend
- ✅ Snapshot strategy for performance optimization
- ✅ CQRS separation with GraphQL APIs
- ✅ Read model projection with Prisma
- ✅ LocalStack integration for local development
- ✅ Complete E2E test coverage

**Use as a reference** when building your own domain models following the same patterns.

---

## Architecture

### System Components

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Write API      │      │ Read Model      │      │  Read API       │
│  (GraphQL)      │      │ Updater (RMU)   │      │  (GraphQL)      │
│                 │      │                 │      │                 │
│  Mutations      │─────▶│  Event Stream   │─────▶│  Queries        │
│  + Aggregates   │      │  Processing     │      │  + Projections  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
  ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
  │  Event      │         │  Event      │        │  Read Model │
  │  Store      │────────▶│  Stream     │        │  Database   │
  │ (DynamoDB)  │         │ (DynamoDB)  │        │   (MySQL)   │
  └─────────────┘         └─────────────┘        └─────────────┘
```

### Layer Structure

Based on Clean Architecture and DDD tactical patterns:

```
modules/
├── command/                      # Write side (CQRS)
│   ├── domain/                  # Pure domain logic
│   │   └── src/cart/            # Cart aggregate, events, value objects
│   ├── interface-adaptor-if/    # Port definitions (CartRepository interface)
│   ├── interface-adaptor-impl/  # Adapter implementations (EventStore integration)
│   └── processor/               # Application services (CartCommandProcessor)
│
├── query/                        # Read side (CQRS)
│   └── interface-adaptor/       # GraphQL resolvers and read model DTOs
│
├── rmu/                          # Read Model Updater
│   └── src/                     # Event handlers and projections
│
├── infrastructure/               # Shared infrastructure utilities
│
└── bootstrap/                    # Application entry points
    └── src/                     # Server startup files
```

---

## Implementation Patterns

### 1. Event-Sourced Aggregate

**Domain Layer** (`modules/command/domain/src/cart/cart.ts`):

```typescript
// cart.ts
class Cart implements Aggregate<Cart, CartId> {
  public readonly id: CartId;
  public readonly deleted: boolean;
  public readonly name: CartName;
  public readonly items: CartItems;
  public readonly sequenceNumber: number;
  public readonly version: number;

  private constructor(params: CartParams) {
    this.id = params.id;
    this.deleted = params.deleted;
    this.name = params.name;
    this.items = params.items;
    this.sequenceNumber = params.sequenceNumber;
    this.version = params.version;
  }

  // Factory method
  static create(id: CartId, name: CartName, executorId: UserAccountId): [Cart, CartCreated] {
    const sequenceNumber = 1;
    const cart = new Cart({
      id,
      deleted: false,
      name,
      items: CartItems.empty(),
      sequenceNumber,
      version: 1,
    });
    const event = CartCreated.of(id, name, executorId, sequenceNumber);
    return [cart, event];
  }

  // Command method returning Either for error handling
  addItem(item: CartItem, executorId: UserAccountId): Either<CartAddItemError, [Cart, CartItemAdded]> {
    if (this.deleted) {
      return E.left(CartAddItemError.of("The cart is deleted"));
    }
    const newItems = this.items.addItem(item);
    const newSequenceNumber = this.sequenceNumber + 1;
    const newCart = new Cart({ ...this, items: newItems, sequenceNumber: newSequenceNumber });
    const event = CartItemAdded.of(this.id, item, executorId, newSequenceNumber);
    return E.right([newCart, event]);
  }

  // Event replay for sourcing
  static replay(events: CartEvent[], snapshot: Cart): Cart {
    return events.reduce((cart, event) => cart.applyEvent(event), snapshot);
  }

  applyEvent(event: CartEvent): Cart {
    switch (event.symbol) {
      case CartItemAddedTypeSymbol:
        return this.addItem((event as CartItemAdded).item, event.executorId).right[0];
      case CartItemRemovedTypeSymbol:
        return this.removeItem((event as CartItemRemoved).item.id, event.executorId).right[0];
      case CartDeletedTypeSymbol:
        return this.delete(event.executorId).right[0];
      default:
        throw new Error("Unknown event");
    }
  }
}
```

### 2. Repository with Event Store

**Repository Layer** (`modules/command/interface-adaptor-impl/src/repository/cart/cart-repository.ts`):

```typescript
import { type EventStore, OptimisticLockError } from 'event-store-adapter-js';
import * as TE from 'fp-ts/TaskEither';

type SnapshotDecider = (event: CartEvent, snapshot: Cart) => boolean;

class CartRepositoryImpl implements CartRepository {
  private constructor(
    public readonly eventStore: EventStore<CartId, Cart, CartEvent>,
    private readonly snapshotDecider: SnapshotDecider | undefined,
  ) {}

  store(event: CartEvent, snapshot: Cart): TE.TaskEither<RepositoryError, void> {
    if (event.isCreated || this.snapshotDecider?.(event, snapshot)) {
      return this.storeEventAndSnapshot(event, snapshot);
    }
    return this.storeEvent(event, snapshot.version);
  }

  storeEvent(event: CartEvent, version: number): TE.TaskEither<RepositoryError, void> {
    return TE.tryCatch(
      () => this.eventStore.persistEvent(event, version),
      (reason) => new RepositoryError("Failed to store event", reason as Error),
    );
  }

  findById(id: CartId): TE.TaskEither<RepositoryError, Cart | undefined> {
    return TE.tryCatch(
      async () => {
        const snapshot = await this.eventStore.getLatestSnapshotById(id);
        if (snapshot === undefined) return undefined;
        const events = await this.eventStore.getEventsByIdSinceSequenceNumber(
          id, snapshot.sequenceNumber + 1
        );
        return Cart.replay(events, snapshot);
      },
      (reason) => new RepositoryError("Failed to find by id", reason as Error),
    );
  }

  // Configurable snapshot strategy (e.g., every 100 events)
  withRetention(numberOfEvents: number): CartRepository {
    return new CartRepositoryImpl(
      this.eventStore,
      (event) => event.sequenceNumber % numberOfEvents === 0
    );
  }
}
```

### 3. GraphQL Mutation (Write API)

**GraphQL Resolver** (`modules/command/interface-adaptor-impl/src/graphql/resolvers.ts`):

```typescript
import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

@Resolver()
class CartCommandResolver {
  @Mutation(() => CartOutput)
  async createCart(
    @Ctx() { cartCommandProcessor }: CommandContext,
    @Arg("input") input: CreateCartInput,
  ): Promise<CartOutput> {
    return pipe(
      this.validateCartName(input.name),
      TE.chainW((validatedName) =>
        pipe(
          this.validateUserAccountId(input.executorId),
          TE.map((validatedExecutorId) => ({ validatedName, validatedExecutorId })),
        ),
      ),
      TE.chainW(({ validatedName, validatedExecutorId }) =>
        cartCommandProcessor.createCart(validatedName, validatedExecutorId),
      ),
      TE.map((cartEvent) => ({ cartId: cartEvent.aggregateId.asString() })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  @Mutation(() => CartItemOutput)
  async addItemToCart(
    @Ctx() { cartCommandProcessor }: CommandContext,
    @Arg("input") input: AddItemToCartInput,
  ): Promise<CartItemOutput> {
    return pipe(
      this.validateCartId(input.cartId),
      TE.chainW((validatedCartId) =>
        cartCommandProcessor.addItemToCart(validatedCartId, validatedItem, validatedExecutorId),
      ),
      TE.map((cartEvent) => ({
        cartId: cartEvent.aggregateId.asString(),
        itemId: validatedItem.id.asString(),
      })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }
}
```

### 4. Read Model Projection (RMU)

**Event Processor** (`modules/rmu/src/update-read-model.ts`):

```typescript
import type { DynamoDBStreamEvent } from "aws-lambda";
import { convertJSONToCartEvent, CartCreatedTypeSymbol, CartItemAddedTypeSymbol } from "cqrs-es-spec-kit-js-command-domain";

class ReadModelUpdater {
  constructor(private readonly cartDao: CartDao) {}

  async updateReadModel(event: DynamoDBStreamEvent): Promise<void> {
    for (const record of event.Records) {
      const payload = Buffer.from(record.dynamodb.NewImage.payload.B, "base64").toString("utf-8");
      const cartEvent = convertJSONToCartEvent(JSON.parse(payload));

      switch (cartEvent.symbol) {
        case CartCreatedTypeSymbol: {
          const typedEvent = cartEvent as CartCreated;
          await this.cartDao.insertCart(typedEvent.aggregateId, typedEvent.name, new Date());
          break;
        }
        case CartItemAddedTypeSymbol: {
          const typedEvent = cartEvent as CartItemAdded;
          await this.cartDao.insertCartItem(typedEvent.aggregateId, typedEvent.item, new Date());
          break;
        }
        case CartDeletedTypeSymbol: {
          const typedEvent = cartEvent as CartDeleted;
          await this.cartDao.deleteCart(typedEvent.aggregateId, new Date());
          break;
        }
      }
    }
  }
}
```

### 5. GraphQL Query (Read API)

**Query Resolver** (`modules/query/interface-adaptor/src/graphql/resolvers.ts`):

```typescript
import type { PrismaClient } from "@prisma/client";
import { Arg, Ctx, Query, Resolver } from "type-graphql";

@Resolver()
class CartQueryResolver {
  @Query(() => CartQueryOutput)
  async getCart(@Ctx() { prisma }: QueryContext, @Arg("cartId") cartId: string): Promise<CartQueryOutput> {
    const carts = await prisma.$queryRaw<CartQueryOutput[]>`
      SELECT o.id, o.name, o.deleted, o.created_at as createdAt, o.updated_at as updatedAt
      FROM carts AS o WHERE o.id = ${cartId}`;
    if (!carts.length) throw new Error("Cart not found");
    return carts[0];
  }

  @Query(() => [CartQueryOutput])
  async getCarts(@Ctx() { prisma }: QueryContext): Promise<CartQueryOutput[]> {
    return prisma.$queryRaw<CartQueryOutput[]>`
      SELECT o.id, o.name, o.deleted, o.created_at as createdAt, o.updated_at as updatedAt
      FROM carts AS o WHERE o.deleted = false`;
  }

  @Query(() => [CartItemQueryOutput])
  async getCartItems(@Ctx() { prisma }: QueryContext, @Arg("cartId") cartId: string): Promise<CartItemQueryOutput[]> {
    return prisma.$queryRaw<CartItemQueryOutput[]>`
      SELECT oi.id, oi.cart_id as cartId, oi.name, oi.quantity, oi.price,
             oi.created_at as createdAt, oi.updated_at as updatedAt
      FROM carts AS o JOIN cart_items AS oi ON o.id = oi.cart_id
      WHERE o.deleted = false AND oi.cart_id = ${cartId}`;
  }
}
```

---

## Kiro Workflow: AI-Driven Development

### Workflow Phases

The Kiro specification-driven workflow enables systematic feature development with AI assistance:

```
Phase 0: Steering (Optional)
    ↓
Phase 1: Specification
    ├─ Requirements Discovery
    ├─ Gap Analysis (optional)
    ├─ Technical Design
    ├─ Design Review (optional)
    └─ Task Generation
    ↓
Phase 2: Implementation
    ├─ TDD-Driven Coding
    └─ Validation (optional)
```

### Commands Reference

All commands work with Codex, Claude Code, Cursor Agent, Gemini with appropriate configuration.

#### Phase 0: Project Steering (Optional)

```bash
# Initialize project-wide architectural decisions
/kiro:steering

# Add custom steering documents (API standards, testing strategy, etc.)
/kiro:steering-custom
```

**Purpose**: Establish project memory for consistent AI guidance across features.

#### Phase 1: Specification

```bash
# 1. Initialize a new feature specification
/kiro:spec-init "User authentication with JWT and refresh tokens"

# 2. Generate detailed requirements
/kiro:spec-requirements authentication

# 3. (Optional) Analyze gaps in existing codebase
/kiro:validate-gap authentication

# 4. Create technical design document
/kiro:spec-design authentication [-y]  # -y skips approval prompt

# 5. (Optional) Review design quality
/kiro:validate-design authentication

# 6. Generate implementation tasks
/kiro:spec-tasks authentication [-y]

# Check progress anytime
/kiro:spec-status authentication
```

#### Phase 2: Implementation

```bash
# Execute tasks with TDD methodology
/kiro:spec-impl authentication          # All tasks
/kiro:spec-impl authentication 1,2,3    # Specific tasks

# Validate implementation against spec
/kiro:validate-impl authentication
```

### Steering vs. Specification

| Aspect | Steering (`.kiro/steering/`) | Specification (`.kiro/specs/`) |
|--------|------------------------------|--------------------------------|
| **Scope** | Project-wide patterns | Feature-specific design |
| **Lifetime** | Long-lived (months/years) | Short-lived (days/weeks) |
| **Content** | Architectural decisions, conventions | Requirements, design, tasks |
| **Examples** | "Use GraphQL for all APIs" | "Implement user authentication" |
| **Files** | `product.md`, `tech.md`, `structure.md` | `requirements.md`, `design.md`, `tasks.md` |

### Best Practices

1. **Steering Setup**: Initialize steering documents before starting features
2. **Human Review**: Review each phase (requirements → design → tasks) before proceeding
3. **Use `-y` Sparingly**: Auto-approval (`-y`) bypasses review gates—use only for simple updates
4. **Keep Steering Current**: Update steering documents as architectural decisions evolve
5. **Gap Analysis**: Run `/kiro:validate-gap` when adding features to existing codebase
6. **Design Validation**: Use `/kiro:validate-design` for critical or complex features

---

## Project Structure

```
cqrs-es-spec-kit-js/
├── .kiro/                        # Kiro workflow configuration
│   ├── steering/                # Project-wide architectural decisions
│   │   ├── product.md          # Product vision and domain
│   │   ├── tech.md             # Technology stack and standards
│   │   └── structure.md        # Code organization patterns
│   ├── specs/                   # Feature specifications (generated)
│   │   └── {feature-name}/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── settings/                # Workflow templates and rules
│       ├── rules/               # AI behavior rules
│       └── templates/           # Document templates
│
├── references/                   # Reference implementations (submodules)
│   ├── event-store-adapter-js/ # Event Store library
│   └── cqrs-es-example-js/     # Production example
│
├── modules/                      # Application code
│   ├── command/                 # Write side
│   ├── query/                   # Read side
│   ├── rmu/                     # Read Model Updater
│   ├── infrastructure/          # Shared infrastructure
│   └── bootstrap/               # Application entry points
│
├── tools/                        # Development and deployment tools
├── AGENTS.md                    # AI agent instructions
├── CLAUDE.md                    # Claude Code configuration
├── GEMINI.md                    # Gemini configuration
└── package.json
```

---

## Reference Implementations

### Event Store Adapter

The foundation library for event persistence and retrieval:

- **Repository**: [event-store-adapter-js](https://github.com/j5ik2o/event-store-adapter-js)
- **Backend**: DynamoDB with optimistic locking
- **Features**: Event persistence, snapshot management, stream queries
- **Installation**: `npm install event-store-adapter-js`
- **Usage**: Add to your `package.json` dependencies for runtime use

### CQRS/ES Example

A complete working implementation demonstrating all patterns:

- **Repository**: [cqrs-es-example-js](https://github.com/j5ik2o/cqrs-es-example-js)
- **Features**:
  - Write API (GraphQL mutations)
  - Read API (GraphQL queries)
  - Read Model Updater (local and AWS Lambda)
  - Docker Compose setup
- **Use Case**: Reference implementation for AI tools to read and learn patterns

### Reference Directory (`references/`)

**Important**: The `references/` directory contains submodules for **AI code reading only**. These are not runtime dependencies.

- **Purpose**: Provide AI tools (Codex, Claude Code, Cursor Agent, Gemini) with concrete implementation examples
- **Location**: Included as Git submodules
- **Usage**: AI tools analyze these for patterns; you add actual npm packages to `package.json`

```bash
# Update reference code for latest patterns
git submodule update --remote

# Explore the example (for learning, not as a dependency)
cd references/cqrs-es-example-js
npm install
docker-compose up -d
npm run build
npm test

# Your actual project dependencies go in package.json
npm install event-store-adapter-js  # Runtime dependency
```

---

## Development Guidelines

### Domain Modeling

1. **Aggregates**: Keep small and focused on single transaction boundaries
2. **Value Objects**: Make immutable and validate in constructor
3. **Domain Events**: Past-tense naming (`UserAccountCreated`, not `CreateUserAccount`)
4. **Command Methods**: Return tuple `[newState, event]` for immutability

### Event Sourcing

1. **Snapshots**: Create periodically (e.g., every 10-50 events) to optimize replay
2. **Event Versioning**: Plan for schema evolution from day one
3. **Idempotency**: Ensure event handlers are idempotent for retry safety
4. **Serialization**: Use explicit conversion functions for JSON ↔ domain objects

### CQRS

1. **Write Model**: Optimized for consistency and business logic
2. **Read Model**: Denormalized for query performance
3. **Eventual Consistency**: Design UI to handle propagation delays
4. **Multiple Projections**: Create specialized read models for different use cases

### GraphQL API

1. **Mutations**: Map 1:1 to aggregate commands (e.g., `createUserAccount`)
2. **Queries**: Fetch from read models only, never from event store
3. **Type Safety**: Use TypeGraphQL decorators for schema generation
4. **Error Handling**: Return structured errors with proper GraphQL error extensions

---

## AI Tool Configuration

### Codex

- Auth: run `pnpm setup-codex` to symlink `~/.codex/auth.json` into `.codex/auth.json`
- Run: `pnpm codex` (invokes `./tools/ai-cli/run-codex.sh`)
- Config: `CODEX_HOME=.codex` so repo-local skills/config are loaded

### Claude Code

- Run: `pnpm claude` (invokes `./tools/ai-cli/run-claude.sh`)
- Permissions: launched with `--dangerously-skip-permissions`, intended for local use

### Cursor Agent

- Run: `./tools/ai-cli/run-cursor.sh` (invokes `cursor-agent --force`)
- Prereq: Cursor Agent CLI must be installed

### Gemini

- Run: `pnpm gemini` (invokes `./tools/ai-cli/run-gemini.sh`)
- Permissions: launched with `--yolo`, intended for local use

---

## Testing Strategy

### Unit Tests
- Domain logic (aggregates, value objects)
- Event serialization/deserialization
- Business rule validation

### Integration Tests
- Repository operations with in-memory event store
- GraphQL resolver behavior
- Read model projection logic

### End-to-End Tests
- Complete command execution (mutation → event → projection → query)
- Docker Compose environment testing
- Event replay and snapshot recovery

#### Running E2E Tests (Cart Domain Example)

The repository includes a comprehensive E2E test script for the Cart domain implementation:

```bash
# Set up environment variables (optional, defaults shown)
export EXECUTOR_ID="UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
export WRITE_API_SERVER_BASE_URL="http://localhost:38080"
export READ_API_SERVER_BASE_URL="http://localhost:38082"

# Run the E2E test script
./tools/e2e-test/verify-cart.sh
```

**Test Coverage**:
- ✅ Cart creation (createCart mutation)
- ✅ Item addition (addItem mutation with 2 items)
- ✅ Cart retrieval (getCart query)
- ✅ Cart list retrieval (getCarts query)
- ✅ CartItem retrieval (getCartItem query)
- ✅ CartItem list retrieval (getCartItems query)
- ✅ Item removal (removeItemFromCart mutation)
- ✅ Cart deletion (deleteCart mutation)
- ✅ Verification of eventual consistency (read model updates)

**Prerequisites**:
- Write API server running on port 38080
- Read API server running on port 38082
- `jq` command-line tool installed for JSON processing

---

## Deployment

### Local Development
```bash
docker-compose up -d          # Start DynamoDB and MySQL
pnpm build                    # Build all packages
```

### Production Considerations

- **Event Store**: DynamoDB with auto-scaling
- **Read Model**: MySQL with read replicas
- **RMU**: AWS Lambda with DynamoDB Streams trigger
- **APIs**: Containerized GraphQL servers (ECS/EKS)
- **Monitoring**: CloudWatch for event processing latency

---

## License

This project is dual-licensed under:

- **MIT License**: See [LICENSE-MIT](./LICENSE-MIT)
- **Apache License 2.0**: See [LICENSE-APACHE](./LICENSE-APACHE)

You may choose either license for your use of this template.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Related Resources

- [Event Store Adapter Documentation](https://github.com/j5ik2o/event-store-adapter-js)
- [CQRS/ES Example Documentation](https://github.com/j5ik2o/cqrs-es-example-js)
- [Domain-Driven Design Reference](https://www.domainlanguage.com/ddd/reference/)
- [CQRS Pattern (Microsoft)](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)

---

## Support

For questions and discussions:

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/cqrs-es-spec-kit-js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/cqrs-es-spec-kit-js/discussions)

---

**Built with ❤️ for the DDD/CQRS/ES community**
