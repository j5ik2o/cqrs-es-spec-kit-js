import { Cart, type CartEvent, type CartId } from "cqrs-es-spec-kit-js-command-domain";
import { type CartRepository, RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import { type EventStore, OptimisticLockError } from "event-store-adapter-js";
import * as TE from "fp-ts/TaskEither";

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

  storeEventAndSnapshot(event: CartEvent, snapshot: Cart): TE.TaskEither<RepositoryError, void> {
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

  findById(id: CartId): TE.TaskEither<RepositoryError, Cart | undefined> {
    return TE.tryCatch(
      async () => {
        const snapshot = await this.eventStore.getLatestSnapshotById(id);
        if (snapshot === undefined) {
          return undefined;
        }
        const events = await this.eventStore.getEventsByIdSinceSequenceNumber(id, snapshot.sequenceNumber + 1);
        return Cart.replay(events, snapshot);
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
    eventStore: EventStore<CartId, Cart, CartEvent>,
    snapshotDecider: SnapshotDecider | undefined = undefined,
  ): CartRepository {
    return new CartRepositoryImpl(eventStore, snapshotDecider);
  }

  withRetention(numberOfEvents: number): CartRepository {
    return new CartRepositoryImpl(this.eventStore, CartRepositoryImpl.retentionCriteriaOf(numberOfEvents));
  }

  static retentionCriteriaOf(numberOfEvents: number): SnapshotDecider {
    return (event: CartEvent, _: Cart) => {
      return event.sequenceNumber % numberOfEvents === 0;
    };
  }
}

export { CartRepositoryImpl, type RepositoryError };
