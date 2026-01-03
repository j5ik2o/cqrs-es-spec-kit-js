import {
  Order,
  OrderId,
  OrderItem,
  OrderItemId,
  OrderName,
  UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { RepositoryError, type OrderRepository } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/TaskEither";
import { OrderCommandProcessor, ProcessInternalError, ProcessNotFoundError } from "./order-command-processor";

const createRepository = (overrides: Partial<OrderRepository> = {}) => {
  const store = jest.fn<ReturnType<OrderRepository["store"]>, Parameters<OrderRepository["store"]>>(() =>
    TE.right(undefined),
  );
  const repository: OrderRepository = {
    withRetention: () => repository,
    storeEvent: () => TE.left(new RepositoryError("storeEvent is not implemented in test")),
    storeEventAndSnapshot: () => TE.left(new RepositoryError("storeEventAndSnapshot is not implemented in test")),
    store,
    findById: () => TE.left(new RepositoryError("findById is not implemented in test")),
    ...overrides,
  };
  return { repository, store };
};

describe("OrderCommandProcessor", () => {
  it("creates an order and stores the created event", async () => {
    const { repository, store } = createRepository();
    const processor = OrderCommandProcessor.of(repository);
    const name = OrderName.of("sample");
    const executorId = UserAccountId.generate();

    const result = await processor.createOrder(name, executorId)();

    expect(E.isRight(result)).toBe(true);
    expect(store).toHaveBeenCalledTimes(1);

    const [storedEvent, storedOrder] = store.mock.calls[0];
    expect(storedEvent.typeName).toBe("OrderCreated");
    expect(storedEvent.aggregateId.equals(storedOrder.id)).toBe(true);
    expect(storedOrder.name.equals(name)).toBe(true);
  });

  it("adds an item and stores the added event", async () => {
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();
    const [order] = Order.create(orderId, OrderName.of("sample"), executorId);
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);
    const findById = jest.fn<ReturnType<OrderRepository["findById"]>, Parameters<OrderRepository["findById"]>>(() =>
      TE.right(order),
    );
    const { repository, store } = createRepository({ findById });
    const processor = OrderCommandProcessor.of(repository);

    const result = await processor.addItemToOrder(orderId, item, executorId)();

    expect(E.isRight(result)).toBe(true);
    expect(store).toHaveBeenCalledTimes(1);

    const [storedEvent, storedOrder] = store.mock.calls[0];
    expect(storedEvent.typeName).toBe("OrderItemAdded");
    expect(storedEvent.aggregateId.equals(orderId)).toBe(true);
    expect(storedOrder.items.containsById(item.id)).toBe(true);
  });

  it("returns a not found error when the order does not exist", async () => {
    const findById = jest.fn<ReturnType<OrderRepository["findById"]>, Parameters<OrderRepository["findById"]>>(() =>
      TE.right(undefined),
    );
    const { repository } = createRepository({ findById });
    const processor = OrderCommandProcessor.of(repository);
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);

    const result = await processor.addItemToOrder(OrderId.generate(), item, UserAccountId.generate())();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ProcessNotFoundError);
    }
  });

  it("removes an item and stores the removed event", async () => {
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);
    const [order] = Order.create(orderId, OrderName.of("sample"), executorId);
    const added = order.addItem(item, executorId);
    const orderWithItem = E.isRight(added) ? added.right[0] : order;
    const findById = jest.fn<ReturnType<OrderRepository["findById"]>, Parameters<OrderRepository["findById"]>>(() =>
      TE.right(orderWithItem),
    );
    const { repository, store } = createRepository({ findById });
    const processor = OrderCommandProcessor.of(repository);

    const result = await processor.removeItemFromOrder(orderId, item.id, executorId)();

    expect(E.isRight(result)).toBe(true);
    expect(store).toHaveBeenCalledTimes(1);
    const [storedEvent, storedOrder] = store.mock.calls[0];
    expect(storedEvent.typeName).toBe("OrderItemRemoved");
    expect(storedOrder.items.containsById(item.id)).toBe(false);
  });

  it("deletes an order and stores the deleted event", async () => {
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();
    const [order] = Order.create(orderId, OrderName.of("sample"), executorId);
    const findById = jest.fn<ReturnType<OrderRepository["findById"]>, Parameters<OrderRepository["findById"]>>(() =>
      TE.right(order),
    );
    const { repository, store } = createRepository({ findById });
    const processor = OrderCommandProcessor.of(repository);

    const result = await processor.deleteOrder(orderId, executorId)();

    expect(E.isRight(result)).toBe(true);
    expect(store).toHaveBeenCalledTimes(1);
    const [storedEvent, storedOrder] = store.mock.calls[0];
    expect(storedEvent.typeName).toBe("OrderDeleted");
    expect(storedOrder.deleted).toBe(true);
  });

  it("converts repository errors into internal errors", async () => {
    const findById = jest.fn<ReturnType<OrderRepository["findById"]>, Parameters<OrderRepository["findById"]>>(() =>
      TE.left(new RepositoryError("failed")),
    );
    const { repository } = createRepository({ findById });
    const processor = OrderCommandProcessor.of(repository);
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);

    const result = await processor.addItemToOrder(OrderId.generate(), item, UserAccountId.generate())();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ProcessInternalError);
    }
  });

  it("converts domain errors into internal errors", async () => {
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();
    const [order] = Order.create(orderId, OrderName.of("sample"), executorId);
    const deletedResult = order.delete(executorId);
    const deletedOrder = E.isRight(deletedResult) ? deletedResult.right[0] : order;
    const findById = jest.fn<ReturnType<OrderRepository["findById"]>, Parameters<OrderRepository["findById"]>>(() =>
      TE.right(deletedOrder),
    );
    const { repository } = createRepository({ findById });
    const processor = OrderCommandProcessor.of(repository);
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);

    const result = await processor.addItemToOrder(orderId, item, executorId)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ProcessInternalError);
    }
  });
});
