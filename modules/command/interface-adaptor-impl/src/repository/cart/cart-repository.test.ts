import {
  Cart,
  CartId,
  CartItem,
  CartItemId,
  CartName,
  CartItemAdded,
  CartEvent,
  UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import { OptimisticLockError } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import { CartRepositoryImpl } from "./cart-repository";

type EventStore = {
  persistEvent: (event: CartEvent, version: number) => Promise<void>;
  persistEventAndSnapshot: (event: CartEvent, snapshot: Cart) => Promise<void>;
  getLatestSnapshotById: (id: CartId) => Promise<Cart | undefined>;
  getEventsByIdSinceSequenceNumber: (id: CartId, sequence: number) => Promise<CartEvent[]>;
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

describe("CartRepositoryImpl", () => {
  it("evaluates retention criteria", () => {
    const decider = CartRepositoryImpl.retentionCriteriaOf(2);
    const snapshot = {} as Cart;
    const event = { sequenceNumber: 4 } as CartEvent;
    const otherEvent = { sequenceNumber: 5 } as CartEvent;

    expect(decider(event, snapshot)).toBe(true);
    expect(decider(otherEvent, snapshot)).toBe(false);
  });

  it("stores events or snapshots based on event type", async () => {
    const cartId = CartId.generate();
    const userId = UserAccountId.generate();
    const [cart, createdEvent] = Cart.create(cartId, CartName.of("sample"), userId);
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);
    const addedEvent = CartItemAdded.of(cartId, item, userId, cart.sequenceNumber + 1);

    const eventStore = createEventStore();
    const repository = CartRepositoryImpl.of(eventStore as never);

    const createdResult = await repository.store(createdEvent as CartEvent, cart)();
    const addedResult = await repository.store(addedEvent as CartEvent, cart)();

    expect(E.isRight(createdResult)).toBe(true);
    expect(E.isRight(addedResult)).toBe(true);
    expect(eventStore.persistEventAndSnapshot).toHaveBeenCalledWith(createdEvent, cart);
    expect(eventStore.persistEvent).toHaveBeenCalledWith(addedEvent, cart.version);
  });

  it("maps optimistic lock errors when storing events", async () => {
    const lockError = new OptimisticLockError("conflict");
    const eventStore = createEventStore({
      persistEvent: jest.fn(async () => {
        throw lockError;
      }),
    });
    const repository = CartRepositoryImpl.of(eventStore as never);
    const event = { sequenceNumber: 1 } as CartEvent;

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
    const repository = CartRepositoryImpl.of(eventStore as never);
    const event = { sequenceNumber: 1 } as CartEvent;
    const snapshot = {} as Cart;

    const result = await repository.storeEventAndSnapshot(event, snapshot)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(RepositoryError);
      expect(result.left.cause).toBe(error);
    }
  });

  it("handles missing snapshot and replays events", async () => {
    const cartId = CartId.generate();
    const userId = UserAccountId.generate();
    const [cart] = Cart.create(cartId, CartName.of("sample"), userId);
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);
    const addedEvent = CartItemAdded.of(cartId, item, userId, cart.sequenceNumber + 1);

    const eventStore = createEventStore({
      getLatestSnapshotById: jest.fn(async () => cart),
      getEventsByIdSinceSequenceNumber: jest.fn(async () => [addedEvent]),
    });
    const repository = CartRepositoryImpl.of(eventStore as never);

    const result = await repository.findById(cartId)();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right?.items.containsById(item.id)).toBe(true);
    }

    const emptyStore = createEventStore({
      getLatestSnapshotById: jest.fn(async () => undefined),
    });
    const emptyRepository = CartRepositoryImpl.of(emptyStore as never);
    const emptyResult = await emptyRepository.findById(cartId)();
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
    const repository = CartRepositoryImpl.of(eventStore as never);

    const result = await repository.findById(CartId.generate())();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(RepositoryError);
    }
  });
});
