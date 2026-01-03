import "reflect-metadata";
import {
  OrderCreated,
  OrderItemAdded,
  OrderItemId,
  OrderName,
  UserAccountId,
  OrderId,
  OrderItem,
  OrderAddItemError,
} from "cqrs-es-spec-kit-js-command-domain";
import { RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import {
  OrderCommandProcessor,
  ProcessInternalError,
  ProcessNotFoundError,
} from "cqrs-es-spec-kit-js-command-processor";
import { OptimisticLockError } from "event-store-adapter-js";
import * as TE from "fp-ts/TaskEither";
import { OrderCommandResolver } from "./resolvers";
import type { CommandContext } from "./resolvers";

type ProcessorOverrides = Partial<{
  createOrder: OrderCommandProcessor["createOrder"];
  addItemToOrder: OrderCommandProcessor["addItemToOrder"];
  removeItemFromOrder: OrderCommandProcessor["removeItemFromOrder"];
  deleteOrder: OrderCommandProcessor["deleteOrder"];
}>;

const createProcessor = (overrides: ProcessorOverrides = {}) => {
  const processor = {
    createOrder: () => TE.left(new ProcessInternalError("not implemented")),
    addItemToOrder: () => TE.left(new ProcessInternalError("not implemented")),
    removeItemFromOrder: () => TE.left(new ProcessInternalError("not implemented")),
    deleteOrder: () => TE.left(new ProcessInternalError("not implemented")),
    ...overrides,
  } as OrderCommandProcessor;

  return processor;
};

describe("OrderCommandResolver", () => {
  it("returns health check", async () => {
    const resolver = new OrderCommandResolver();

    await expect(resolver.healthCheck()).resolves.toEqual({ value: "OK" });
  });

  it("creates an order", async () => {
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();
    const event = OrderCreated.of(orderId, OrderName.of("sample"), executorId, 1);
    const processor = createProcessor({
      createOrder: () => TE.right(event),
    });
    const resolver = new OrderCommandResolver();

    const result = await resolver.createOrder(
      { orderCommandProcessor: processor } as CommandContext,
      { name: "sample", executorId: executorId.asString() },
    );

    expect(result.orderId).toBe(orderId.asString());
  });

  it("adds an item", async () => {
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);
    const event = OrderItemAdded.of(orderId, item, executorId, 2);
    const processor = createProcessor({
      addItemToOrder: () => TE.right(event),
    });
    const resolver = new OrderCommandResolver();

    const result = await resolver.addItem(
      { orderCommandProcessor: processor } as CommandContext,
      { orderId: orderId.asString(), name: "item", quantity: 1, price: 100, executorId: executorId.asString() },
    );

    expect(result.orderId).toBe(orderId.asString());
    expect(result.itemId.startsWith("OrderItem-")).toBe(true);
  });

  it("returns validation errors for invalid input", async () => {
    const resolver = new OrderCommandResolver();

    await expect(
      resolver.deleteOrder(
        { orderCommandProcessor: createProcessor() } as CommandContext,
        { orderId: "invalid", executorId: "invalid" },
      ),
    ).rejects.toMatchObject({ extensions: { code: "400" } });
  });

  it("maps not found errors", async () => {
    const processor = createProcessor({
      removeItemFromOrder: () => TE.left(new ProcessNotFoundError("not found")),
    });
    const resolver = new OrderCommandResolver();

    await expect(
      resolver.removeItem(
        { orderCommandProcessor: processor } as CommandContext,
        { orderId: OrderId.generate().asString(), itemId: OrderItemId.generate().asString(), executorId: UserAccountId.generate().asString() },
      ),
    ).rejects.toMatchObject({ extensions: { code: "404" } });
  });

  it("maps optimistic lock errors", async () => {
    const optimistic = new OptimisticLockError("conflict");
    const error = new ProcessInternalError(
      "conflict",
      new RepositoryError("repo", optimistic),
    );
    const processor = createProcessor({
      deleteOrder: () => TE.left(error),
    });
    const resolver = new OrderCommandResolver();

    await expect(
      resolver.deleteOrder(
        { orderCommandProcessor: processor } as CommandContext,
        { orderId: OrderId.generate().asString(), executorId: UserAccountId.generate().asString() },
      ),
    ).rejects.toMatchObject({ extensions: { code: "409" } });
  });

  it("maps domain errors", async () => {
    const error = new ProcessInternalError(
      "domain",
      OrderAddItemError.of("invalid"),
    );
    const processor = createProcessor({
      createOrder: () => TE.left(error),
    });
    const resolver = new OrderCommandResolver();

    await expect(
      resolver.createOrder(
        { orderCommandProcessor: processor } as CommandContext,
        { name: "sample", executorId: UserAccountId.generate().asString() },
      ),
    ).rejects.toMatchObject({ extensions: { code: "422" } });
  });
});
