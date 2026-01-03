import { Order, type OrderEvent, type OrderId } from "cqrs-es-spec-kit-js-command-domain";
import { type OrderRepository, RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import { type EventStore, OptimisticLockError } from "event-store-adapter-js";
import * as TE from "fp-ts/TaskEither";

type SnapshotDecider = (event: OrderEvent, snapshot: Order) => boolean;

class OrderRepositoryImpl implements OrderRepository {
  private constructor(
    public readonly eventStore: EventStore<OrderId, Order, OrderEvent>,
    private readonly snapshotDecider: SnapshotDecider | undefined,
  ) {}

  store(event: OrderEvent, snapshot: Order): TE.TaskEither<RepositoryError, void> {
    if (event.isCreated || this.snapshotDecider?.(event, snapshot)) {
      return this.storeEventAndSnapshot(event, snapshot);
    }
    return this.storeEvent(event, snapshot.version);
  }

  storeEvent(event: OrderEvent, version: number): TE.TaskEither<RepositoryError, void> {
    return TE.tryCatch(
      () => this.eventStore.persistEvent(event, version),
      (reason) => {
        if (reason instanceof OptimisticLockError) {
          return new RepositoryError("Failed to store event due to optimistic lock error", reason);
        }
        if (reason instanceof Error) {
          return new RepositoryError("Failed to store event due to error", reason);
        }
        return new RepositoryError(String(reason));
      },
    );
  }

  storeEventAndSnapshot(event: OrderEvent, snapshot: Order): TE.TaskEither<RepositoryError, void> {
    return TE.tryCatch(
      () => this.eventStore.persistEventAndSnapshot(event, snapshot),
      (reason) => {
        if (reason instanceof OptimisticLockError) {
          return new RepositoryError("Failed to store event and snapshot due to optimistic lock error", reason);
        }
        if (reason instanceof Error) {
          return new RepositoryError("Failed to store event and snapshot due to error", reason);
        }
        return new RepositoryError(String(reason));
      },
    );
  }

  findById(id: OrderId): TE.TaskEither<RepositoryError, Order | undefined> {
    return TE.tryCatch(
      async () => {
        const snapshot = await this.eventStore.getLatestSnapshotById(id);
        if (snapshot === undefined) {
          return undefined;
        }
        const events = await this.eventStore.getEventsByIdSinceSequenceNumber(id, snapshot.sequenceNumber + 1);
        return Order.replay(events, snapshot);
      },
      (reason) => {
        if (reason instanceof Error) {
          return new RepositoryError("Failed to find by id", reason);
        }
        return new RepositoryError(String(reason));
      },
    );
  }

  static of(
    eventStore: EventStore<OrderId, Order, OrderEvent>,
    snapshotDecider: SnapshotDecider | undefined = undefined,
  ): OrderRepository {
    return new OrderRepositoryImpl(eventStore, snapshotDecider);
  }

  withRetention(numberOfEvents: number): OrderRepository {
    return new OrderRepositoryImpl(this.eventStore, OrderRepositoryImpl.retentionCriteriaOf(numberOfEvents));
  }

  static retentionCriteriaOf(numberOfEvents: number): SnapshotDecider {
    return (event: OrderEvent, _: Order) => {
      return event.sequenceNumber % numberOfEvents === 0;
    };
  }
}

export { OrderRepositoryImpl, type RepositoryError };
