import type { Order, OrderEvent, OrderId } from "cqrs-es-spec-kit-js-command-domain";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { RepositoryError, type OrderRepository } from "./order-repository";

describe("OrderRepository", () => {
  it("satisfies the required contract", async () => {
    const repository: OrderRepository = {
      withRetention: () => repository,
      storeEvent: () => TE.left(new RepositoryError("storeEvent")),
      storeEventAndSnapshot: () => TE.left(new RepositoryError("storeEventAndSnapshot")),
      store: () => TE.left(new RepositoryError("store")),
      findById: () => TE.left(new RepositoryError("findById")),
    };

    const event = {} as OrderEvent;
    const order = {} as Order;
    const id = {} as OrderId;

    expect(repository.withRetention(1)).toBe(repository);
    expect(E.isLeft(await repository.storeEvent(event, 0)())).toBe(true);
    expect(E.isLeft(await repository.storeEventAndSnapshot(event, order)())).toBe(true);
    expect(E.isLeft(await repository.store(event, order)())).toBe(true);
    expect(E.isLeft(await repository.findById(id)())).toBe(true);
  });
});
