import type { Cart, CartEvent, CartId } from "cqrs-es-spec-kit-js-command-domain";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { RepositoryError, type CartRepository } from "./cart-repository";

describe("CartRepository", () => {
  it("satisfies the required contract", async () => {
    const repository: CartRepository = {
      withRetention: () => repository,
      storeEvent: () => TE.left(new RepositoryError("storeEvent")),
      storeEventAndSnapshot: () => TE.left(new RepositoryError("storeEventAndSnapshot")),
      store: () => TE.left(new RepositoryError("store")),
      findById: () => TE.left(new RepositoryError("findById")),
    };

    const event = {} as CartEvent;
    const cart = {} as Cart;
    const id = {} as CartId;

    expect(repository.withRetention(1)).toBe(repository);
    expect(E.isLeft(await repository.storeEvent(event, 0)())).toBe(true);
    expect(E.isLeft(await repository.storeEventAndSnapshot(event, cart)())).toBe(true);
    expect(E.isLeft(await repository.store(event, cart)())).toBe(true);
    expect(E.isLeft(await repository.findById(id)())).toBe(true);
  });
});
