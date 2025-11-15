# cqrs-es-spec-kit-js

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**AI-Driven Specification Kit for CQRS/Event Sourcing with DDD and GraphQL**

A comprehensive template repository that combines Domain-Driven Design (DDD), CQRS/Event Sourcing patterns, and GraphQL with AI-powered specification-driven development workflows.

[日本語](./README.ja.md)

---

## Overview

`cqrs-es-spec-kit-js` provides a production-ready foundation for building scalable event-sourced systems using:

- **Domain-Driven Design (DDD)**: Tactical patterns for aggregate modeling and bounded contexts
- **CQRS/Event Sourcing**: Complete separation of write and read models with event-driven architecture
- **GraphQL**: Type-safe API layer for both commands (mutations) and queries
- **AI-Driven Specification**: Kiro-style workflow leveraging AI tools (Claude Code, Gemini, Codex) for systematic feature development

This template is designed for **developers who understand DDD/CQRS/ES fundamentals** and are seeking proven implementation patterns and AI-assisted development workflows.

---

## Features

### Core Architecture
- ✅ **Event Store Foundation**: Built on [event-store-adapter-js](https://github.com/j5ik2o/event-store-adapter-js) with DynamoDB backend
- ✅ **CQRS Implementation**: Separated write and read models with GraphQL API
- ✅ **Read Model Updater**: Event-driven projection builder for query-side optimization
- ✅ **Reference Implementation**: Production-grade example from [cqrs-es-example-js](https://github.com/j5ik2o/cqrs-es-example-js)

### AI-Powered Development
- ✅ **Kiro Workflow**: Structured specification → design → implementation phases
- ✅ **Multi-AI Support**: Works with Claude Code, Gemini, and Codex
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

- Node.js 18+ (LTS recommended)
- Docker & Docker Compose (for local infrastructure)
- AI Coding Tool: Claude Code, Gemini, or Codex
- Basic understanding of DDD, CQRS/ES, and GraphQL

### Installation

1. **Use this template**:
   ```bash
   # Click "Use this template" on GitHub, or clone directly:
   git clone --recursive https://github.com/YOUR_USERNAME/YOUR_PROJECT.git
   cd YOUR_PROJECT
   ```

2. **Initialize submodules** (reference implementations):
   ```bash
   git submodule update --init --recursive
   ```

3. **Install dependencies**:
   ```bash
   npm install

   # Add event-store-adapter-js to your project
   npm install event-store-adapter-js
   ```

4. **Explore reference implementations** (for AI code reading):
   ```bash
   # The references/ directory contains example code for AI tools to reference
   # These are NOT used as runtime dependencies

   # Check the complete working example
   cd references/cqrs-es-example-js

   # Review event store adapter implementation patterns
   cd references/event-store-adapter-js
   ```

---

## Example Implementation: Order Domain

This repository includes a complete **Order domain** implementation demonstrating the full CQRS/ES stack:

### Domain Model

**Aggregate Root**: `Order` (modules/command/domain/src/order/)
- Value Objects: `OrderId`, `OrderName`
- Entity: `OrderItem` with `OrderItemId`, `Quantity`, `Price`
- Domain Events: `OrderCreated`, `OrderItemAdded`, `OrderItemRemoved`, `OrderDeleted`

**Key Features**:
- Event sourcing with `replay()` and `applyEvent()` methods
- Immutable command methods returning `[newState, event]` tuples
- Snapshot optimization via `OrderRepositoryImpl` (every 100 events)

### Module Structure

```
modules/
├── command/
│   ├── domain/                      # Order aggregate and events
│   ├── interface-adaptor-if/        # OrderRepository interface
│   ├── interface-adaptor-impl/      # EventStore integration
│   └── processor/                   # OrderCommandProcessor
├── query/
│   └── interface-adaptor/           # GraphQL query resolvers
├── rmu/
│   └── src/                         # Read model updater (Prisma)
└── bootstrap/
    ├── write-api-main.ts            # Command API server
    ├── read-api-main.ts             # Query API server
    └── local-rmu-main.ts            # LocalStack RMU
```

### Running the Example

#### Option 1: Using Docker (Recommended)

1. **Build Docker image**:
   ```bash
   ./tools/scripts/docker-build.sh
   ```

2. **Start all services**:
   ```bash
   ./tools/scripts/docker-up.sh
   ```

3. **Run E2E tests**:
   ```bash
   ./tools/e2e-test/verify-order.sh
   ```

4. **View logs**:
   ```bash
   ./tools/scripts/docker-logs.sh
   ```

5. **Stop all services**:
   ```bash
   ./tools/scripts/docker-down.sh
   ```

**Services Available**:
- Write API: http://localhost:38080
- Read API: http://localhost:38082
- Read Model Updater: http://localhost:38081
- DynamoDB Admin: http://localhost:38003
- phpMyAdmin: http://localhost:24040

#### Option 2: Running Locally

1. **Start infrastructure**:
   ```bash
   docker-compose up -d mysql localstack dynamodb-setup dynamodb-admin phpmyadmin migration
   ```

2. **Build and start servers**:
   ```bash
   pnpm install
   pnpm build

   # Terminal 1: Write API (port 38080)
   node modules/bootstrap/dist/index.js writeApi

   # Terminal 2: Read API (port 38082)
   node modules/bootstrap/dist/index.js readApi

   # Terminal 3: Read Model Updater
   node modules/bootstrap/dist/index.js localRmu
   ```

3. **Run E2E tests**:
   ```bash
   ./tools/e2e-test/verify-order.sh
   ```

### GraphQL API Examples

**Create Order**:
```graphql
mutation {
  createOrder(input: {
    name: "Sample Order"
    executorId: "UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
  }) {
    orderId
  }
}
```

**Add Item**:
```graphql
mutation {
  addItem(input: {
    orderId: "Order-01234567890"
    name: "Product A"
    quantity: 2
    price: 1000
    executorId: "UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
  }) {
    orderId
    itemId
  }
}
```

**Query Order**:
```graphql
query {
  getOrder(orderId: "Order-01234567890") {
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
  │ (DynamoDB)  │         │ (DynamoDB)  │        │ (PostgreSQL)│
  └─────────────┘         └─────────────┘        └─────────────┘
```

### Layer Structure

Based on Clean Architecture and DDD tactical patterns:

```
packages/
├── command/                      # Write side (CQRS)
│   ├── domain/                  # Pure domain logic
│   │   ├── aggregates/          # Aggregate roots
│   │   ├── entities/            # Domain entities
│   │   ├── value-objects/       # Immutable values
│   │   └── events/              # Domain events
│   ├── interface-adaptor-if/    # Port definitions
│   ├── interface-adaptor-impl/  # Adapter implementations
│   └── processor/               # Application services
│
├── query/                        # Read side (CQRS)
│   ├── interface-adaptor/       # GraphQL resolvers
│   └── domain/                  # Read model DTOs
│
├── rmu/                          # Read Model Updater
│   ├── processors/              # Event handlers
│   └── projections/             # Read model builders
│
└── infrastructure/               # Shared infrastructure
    ├── event-store/             # Event persistence
    └── database/                # Read model storage
```

---

## Implementation Patterns

### 1. Event-Sourced Aggregate

**Domain Layer** (`packages/command/domain/`):

```typescript
// user-account.ts
export class UserAccount {
  private constructor(
    public readonly id: UserAccountId,
    public readonly name: string,
    public readonly sequenceNumber: number,
    public readonly version: number
  ) {}

  // Factory method
  static create(id: UserAccountId, name: string): [UserAccount, UserAccountCreated] {
    const account = new UserAccount(id, name, 1, 1);
    const event = new UserAccountCreated(id, name);
    return [account, event];
  }

  // Command method
  rename(newName: string): [UserAccount, UserAccountRenamed] {
    const updated = new UserAccount(
      this.id,
      newName,
      this.sequenceNumber + 1,
      this.version + 1
    );
    const event = new UserAccountRenamed(this.id, newName);
    return [updated, event];
  }

  // Event replay for sourcing
  static replay(events: UserAccountEvent[], snapshot?: UserAccount): UserAccount {
    let account = snapshot ?? throw new Error("Initial snapshot required");
    for (const event of events) {
      account = account.applyEvent(event);
    }
    return account;
  }

  private applyEvent(event: UserAccountEvent): UserAccount {
    if (event instanceof UserAccountRenamed) {
      return new UserAccount(
        this.id,
        event.name,
        this.sequenceNumber + 1,
        this.version + 1
      );
    }
    return this;
  }
}
```

### 2. Repository with Event Store

**Repository Layer** (`packages/command/interface-adaptor-impl/`):

```typescript
import { EventStore } from 'event-store-adapter-js';

export class UserAccountRepository {
  constructor(
    private readonly eventStore: EventStore<
      UserAccountId,
      UserAccount,
      UserAccountEvent
    >
  ) {}

  async storeEvent(event: UserAccountEvent, version: number): Promise<void> {
    await this.eventStore.persistEvent(event, version);
  }

  async storeEventAndSnapshot(
    event: UserAccountEvent,
    snapshot: UserAccount
  ): Promise<void> {
    await this.eventStore.persistEventAndSnapshot(event, snapshot);
  }

  async findById(id: UserAccountId): Promise<UserAccount | undefined> {
    const snapshot = await this.eventStore.getLatestSnapshotById(
      id,
      convertJSONToUserAccount
    );

    if (!snapshot) return undefined;

    const events = await this.eventStore.getEventsByIdSinceSequenceNumber(
      id,
      snapshot.sequenceNumber + 1,
      convertJSONToUserAccountEvent
    );

    return UserAccount.replay(events, snapshot);
  }
}
```

### 3. GraphQL Mutation (Write API)

**GraphQL Resolver** (`packages/command/interface-adaptor-impl/`):

```typescript
import { Resolver, Mutation, Arg } from 'type-graphql';

@Resolver()
export class UserAccountMutationResolver {
  constructor(private readonly repository: UserAccountRepository) {}

  @Mutation(() => UserAccountPayload)
  async createUserAccount(
    @Arg('input') input: CreateUserAccountInput
  ): Promise<UserAccountPayload> {
    const id = new UserAccountId(ulid());
    const [account, event] = UserAccount.create(id, input.name);

    await this.repository.storeEventAndSnapshot(event, account);

    return { userAccountId: id.value };
  }

  @Mutation(() => UserAccountPayload)
  async renameUserAccount(
    @Arg('input') input: RenameUserAccountInput
  ): Promise<UserAccountPayload> {
    const id = new UserAccountId(input.userAccountId);
    const account = await this.repository.findById(id);

    if (!account) throw new Error('Account not found');

    const [updated, event] = account.rename(input.newName);
    await this.repository.storeEvent(event, updated.version);

    return { userAccountId: id.value };
  }
}
```

### 4. Read Model Projection (RMU)

**Event Processor** (`packages/rmu/`):

```typescript
export class UserAccountProjection {
  constructor(private readonly prisma: PrismaClient) {}

  async handleUserAccountCreated(event: UserAccountCreated): Promise<void> {
    await this.prisma.userAccountReadModel.create({
      data: {
        id: event.aggregateId.value,
        name: event.name,
        createdAt: event.occurredAt,
        updatedAt: event.occurredAt,
      },
    });
  }

  async handleUserAccountRenamed(event: UserAccountRenamed): Promise<void> {
    await this.prisma.userAccountReadModel.update({
      where: { id: event.aggregateId.value },
      data: {
        name: event.name,
        updatedAt: event.occurredAt,
      },
    });
  }
}
```

### 5. GraphQL Query (Read API)

**Query Resolver** (`packages/query/interface-adaptor/`):

```typescript
@Resolver()
export class UserAccountQueryResolver {
  constructor(private readonly prisma: PrismaClient) {}

  @Query(() => UserAccountReadModel, { nullable: true })
  async userAccount(
    @Arg('id') id: string
  ): Promise<UserAccountReadModel | null> {
    return this.prisma.userAccountReadModel.findUnique({
      where: { id },
    });
  }

  @Query(() => [UserAccountReadModel])
  async userAccounts(): Promise<UserAccountReadModel[]> {
    return this.prisma.userAccountReadModel.findMany();
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

All commands work with Claude Code (`/kiro:*`), Gemini, and Codex with appropriate configuration.

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
├── packages/                     # Your application code (to be created)
│   ├── command/                 # Write side
│   ├── query/                   # Read side
│   ├── rmu/                     # Read Model Updater
│   └── infrastructure/          # Shared infrastructure
│
├── scripts/                      # Development and deployment scripts
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

- **Purpose**: Provide AI tools (Claude Code, Gemini, Codex) with concrete implementation examples
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

### Claude Code

- **Commands**: `/kiro:*` namespace (e.g., `/kiro:spec-init`, `/kiro:spec-impl`)
- **Configuration**: See `CLAUDE.md` for project-specific instructions
- **Integration**: Automatic `.kiro/steering/` loading

### Gemini

- **Commands**: Same `/kiro:*` namespace via `GEMINI.md` configuration
- **Prompts**: Custom prompts in `.gemini/` directory

### Codex

- **Commands**: Same `/kiro:*` namespace via `.codex/` directory
- **Workflow**: Cursor-based workflow integration

All AI tools share the same underlying Kiro workflow and specifications in `.kiro/`.

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

#### Running E2E Tests (Order Domain Example)

The repository includes a comprehensive E2E test script for the Order domain implementation:

```bash
# Set up environment variables (optional, defaults shown)
export EXECUTOR_ID="UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z"
export WRITE_API_SERVER_BASE_URL="http://localhost:38080"
export READ_API_SERVER_BASE_URL="http://localhost:38082"

# Run the E2E test script
./tools/e2e-test/verify-order.sh
```

**Test Coverage**:
- ✅ Order creation (createOrder mutation)
- ✅ Item addition (addItem mutation with 2 items)
- ✅ Order retrieval (getOrder query)
- ✅ Order list retrieval (getOrders query)
- ✅ OrderItem retrieval (getOrderItem query)
- ✅ OrderItem list retrieval (getOrderItems query)
- ✅ Item removal (removeItem mutation)
- ✅ Order deletion (deleteOrder mutation)
- ✅ Verification of eventual consistency (read model updates)

**Prerequisites**:
- Write API server running on port 38080
- Read API server running on port 38082
- `jq` command-line tool installed for JSON processing

---

## Deployment

### Local Development
```bash
docker-compose up -d          # Start DynamoDB and PostgreSQL
npm run build                 # Build all packages
npm run dev                   # Start in development mode
```

### Production Considerations

- **Event Store**: DynamoDB with auto-scaling
- **Read Model**: PostgreSQL with read replicas
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
