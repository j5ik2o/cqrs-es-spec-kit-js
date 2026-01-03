import {
  Order,
  OrderId,
  OrderItem,
  OrderItemId,
  OrderName,
  OrderItemAdded,
  OrderEvent,
  UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import { OptimisticLockError } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import { OrderRepositoryImpl } from "./order-repository";

type EventStore = {
  persistEvent: (event: OrderEvent, version: number) => Promise<void>;
  persistEventAndSnapshot: (event: OrderEvent, snapshot: Order) => Promise<void>;
  getLatestSnapshotById: (id: OrderId) => Promise<Order | undefined>;
  getEventsByIdSinceSequenceNumber: (id: OrderId, sequence: number) => Promise<OrderEvent[]>;
};

const createEventStore = (overrides: Partial<EventStore> = {}) => {
  const store: EventStore = {
    persistEvent: jest.fn(async () => undefined),
    persistEventAndSnapshot: jest.fn(async () => undefined),
    getLatestSnapshotById: jest.fn(async () => undefined),
    getEventsByIdSinceSequenceNumber: jest.fn(async () => []),
    ...overrides,
  };
  return store;
};

describe("OrderRepositoryImpl", () => {
  it("evaluates retention criteria", () => {
    const decider = OrderRepositoryImpl.retentionCriteriaOf(2);
    const snapshot = {} as Order;
    const event = { sequenceNumber: 4 } as OrderEvent;
    const otherEvent = { sequenceNumber: 5 } as OrderEvent;

    expect(decider(event, snapshot)).toBe(true);
    expect(decider(otherEvent, snapshot)).toBe(false);
  });

  it("stores events or snapshots based on event type", async () => {
    const orderId = OrderId.generate();
    const userId = UserAccountId.generate();
    const [order, createdEvent] = Order.create(orderId, OrderName.of("sample"), userId);
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);
    const addedEvent = OrderItemAdded.of(orderId, item, userId, order.sequenceNumber + 1);

    const eventStore = createEventStore();
    const repository = OrderRepositoryImpl.of(eventStore as never);

    const createdResult = await repository.store(createdEvent as OrderEvent, order)();
    const addedResult = await repository.store(addedEvent as OrderEvent, order)();

    expect(E.isRight(createdResult)).toBe(true);
    expect(E.isRight(addedResult)).toBe(true);
    expect(eventStore.persistEventAndSnapshot).toHaveBeenCalledWith(createdEvent, order);
    expect(eventStore.persistEvent).toHaveBeenCalledWith(addedEvent, order.version);
  });

  it("maps optimistic lock errors when storing events", async () => {
    const lockError = new OptimisticLockError("conflict");
    const eventStore = createEventStore({
      persistEvent: jest.fn(async () => {
        throw lockError;
      }),
    });
    const repository = OrderRepositoryImpl.of(eventStore as never);
    const event = { sequenceNumber: 1 } as OrderEvent;

    const result = await repository.storeEvent(event, 1)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(RepositoryError);
      expect(result.left.cause).toBe(lockError);
    }
  });

  it("maps generic errors when storing snapshots", async () => {
    const error = new Error("failed");
    const eventStore = createEventStore({
      persistEventAndSnapshot: jest.fn(async () => {
        throw error;
      }),
    });
    const repository = OrderRepositoryImpl.of(eventStore as never);
    const event = { sequenceNumber: 1 } as OrderEvent;
    const snapshot = {} as Order;

    const result = await repository.storeEventAndSnapshot(event, snapshot)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(RepositoryError);
      expect(result.left.cause).toBe(error);
    }
  });

  it("handles missing snapshot and replays events", async () => {
    const orderId = OrderId.generate();
    const userId = UserAccountId.generate();
    const [order] = Order.create(orderId, OrderName.of("sample"), userId);
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);
    const addedEvent = OrderItemAdded.of(orderId, item, userId, order.sequenceNumber + 1);

    const eventStore = createEventStore({
      getLatestSnapshotById: jest.fn(async () => order),
      getEventsByIdSinceSequenceNumber: jest.fn(async () => [addedEvent]),
    });
    const repository = OrderRepositoryImpl.of(eventStore as never);

    const result = await repository.findById(orderId)();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right?.items.containsById(item.id)).toBe(true);
    }

    const emptyStore = createEventStore({
      getLatestSnapshotById: jest.fn(async () => undefined),
    });
    const emptyRepository = OrderRepositoryImpl.of(emptyStore as never);
    const emptyResult = await emptyRepository.findById(orderId)();
    expect(E.isRight(emptyResult)).toBe(true);
    if (E.isRight(emptyResult)) {
      expect(emptyResult.right).toBeUndefined();
    }
  });

  it("maps errors when finding by id", async () => {
    const error = new Error("failed");
    const eventStore = createEventStore({
      getLatestSnapshotById: jest.fn(async () => {
        throw error;
      }),
    });
    const repository = OrderRepositoryImpl.of(eventStore as never);

    const result = await repository.findById(OrderId.generate())();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(RepositoryError);
    }
  });
});
