import type { Cart, CartEvent, CartId } from "cqrs-es-spec-kit-js-command-domain";
import type * as TE from "fp-ts/TaskEither";

class RepositoryError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "RepositoryError";
    this.cause = cause;
  }
}

interface CartRepository {
  withRetention(numberOfEvents: number): CartRepository;

  storeEvent(event: CartEvent, version: number): TE.TaskEither<RepositoryError, void>;

  storeEventAndSnapshot(event: CartEvent, snapshot: Cart): TE.TaskEither<RepositoryError, void>;

  store(event: CartEvent, snapshot: Cart): TE.TaskEither<RepositoryError, void>;

  findById(id: CartId): TE.TaskEither<RepositoryError, Cart | undefined>;
}

export { type CartRepository, RepositoryError };
