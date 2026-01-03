import type { Order, OrderEvent, OrderId } from "cqrs-es-spec-kit-js-command-domain";
import type * as TE from "fp-ts/TaskEither";

class RepositoryError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "RepositoryError";
    this.cause = cause;
  }
}

interface OrderRepository {
  withRetention(numberOfEvents: number): OrderRepository;

  storeEvent(event: OrderEvent, version: number): TE.TaskEither<RepositoryError, void>;

  storeEventAndSnapshot(event: OrderEvent, snapshot: Order): TE.TaskEither<RepositoryError, void>;

  store(event: OrderEvent, snapshot: Order): TE.TaskEither<RepositoryError, void>;

  findById(id: OrderId): TE.TaskEither<RepositoryError, Order | undefined>;
}

export { type OrderRepository, RepositoryError };
