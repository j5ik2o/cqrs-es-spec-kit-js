import {
  Cart,
  CartId,
  CartItem,
  CartItemId,
  CartName,
  UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { RepositoryError, type CartRepository } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/TaskEither";
import { CartCommandProcessor, ProcessInternalError, ProcessNotFoundError } from "./cart-command-processor";

const createRepository = (overrides: Partial<CartRepository> = {}) => {
  const store = jest.fn<ReturnType<CartRepository["store"]>, Parameters<CartRepository["store"]>>(() =>
    TE.right(undefined),
  );
  const repository: CartRepository = {
    withRetention: () => repository,
    storeEvent: () => TE.left(new RepositoryError("storeEvent is not implemented in test")),
    storeEventAndSnapshot: () => TE.left(new RepositoryError("storeEventAndSnapshot is not implemented in test")),
    store,
    findById: () => TE.left(new RepositoryError("findById is not implemented in test")),
    ...overrides,
  };
  return { repository, store };
};

describe("CartCommandProcessor", () => {
  it("creates an cart and stores the created event", async () => {
    const { repository, store } = createRepository();
    const processor = CartCommandProcessor.of(repository);
    const name = CartName.of("sample");
    const executorId = UserAccountId.generate();

    const result = await processor.createCart(name, executorId)();

    expect(E.isRight(result)).toBe(true);
    expect(store).toHaveBeenCalledTimes(1);

    const [storedEvent, storedCart] = store.mock.calls[0];
    expect(storedEvent.typeName).toBe("CartCreated");
    expect(storedEvent.aggregateId.equals(storedCart.id)).toBe(true);
    expect(storedCart.name.equals(name)).toBe(true);
  });

  it("adds an item and stores the added event", async () => {
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();
    const [cart] = Cart.create(cartId, CartName.of("sample"), executorId);
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);
    const findById = jest.fn<ReturnType<CartRepository["findById"]>, Parameters<CartRepository["findById"]>>(() =>
      TE.right(cart),
    );
    const { repository, store } = createRepository({ findById });
    const processor = CartCommandProcessor.of(repository);

    const result = await processor.addItemToCart(cartId, item, executorId)();

    expect(E.isRight(result)).toBe(true);
    expect(store).toHaveBeenCalledTimes(1);

    const [storedEvent, storedCart] = store.mock.calls[0];
    expect(storedEvent.typeName).toBe("CartItemAdded");
    expect(storedEvent.aggregateId.equals(cartId)).toBe(true);
    expect(storedCart.items.containsById(item.id)).toBe(true);
  });

  it("returns a not found error when the cart does not exist", async () => {
    const findById = jest.fn<ReturnType<CartRepository["findById"]>, Parameters<CartRepository["findById"]>>(() =>
      TE.right(undefined),
    );
    const { repository } = createRepository({ findById });
    const processor = CartCommandProcessor.of(repository);
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);

    const result = await processor.addItemToCart(CartId.generate(), item, UserAccountId.generate())();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ProcessNotFoundError);
    }
  });

  it("removes an item and stores the removed event", async () => {
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);
    const [cart] = Cart.create(cartId, CartName.of("sample"), executorId);
    const added = cart.addItem(item, executorId);
    const cartWithItem = E.isRight(added) ? added.right[0] : cart;
    const findById = jest.fn<ReturnType<CartRepository["findById"]>, Parameters<CartRepository["findById"]>>(() =>
      TE.right(cartWithItem),
    );
    const { repository, store } = createRepository({ findById });
    const processor = CartCommandProcessor.of(repository);

    const result = await processor.removeItemFromCart(cartId, item.id, executorId)();

    expect(E.isRight(result)).toBe(true);
    expect(store).toHaveBeenCalledTimes(1);
    const [storedEvent, storedCart] = store.mock.calls[0];
    expect(storedEvent.typeName).toBe("CartItemRemoved");
    expect(storedCart.items.containsById(item.id)).toBe(false);
  });

  it("deletes an cart and stores the deleted event", async () => {
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();
    const [cart] = Cart.create(cartId, CartName.of("sample"), executorId);
    const findById = jest.fn<ReturnType<CartRepository["findById"]>, Parameters<CartRepository["findById"]>>(() =>
      TE.right(cart),
    );
    const { repository, store } = createRepository({ findById });
    const processor = CartCommandProcessor.of(repository);

    const result = await processor.deleteCart(cartId, executorId)();

    expect(E.isRight(result)).toBe(true);
    expect(store).toHaveBeenCalledTimes(1);
    const [storedEvent, storedCart] = store.mock.calls[0];
    expect(storedEvent.typeName).toBe("CartDeleted");
    expect(storedCart.deleted).toBe(true);
  });

  it("converts repository errors into internal errors", async () => {
    const findById = jest.fn<ReturnType<CartRepository["findById"]>, Parameters<CartRepository["findById"]>>(() =>
      TE.left(new RepositoryError("failed")),
    );
    const { repository } = createRepository({ findById });
    const processor = CartCommandProcessor.of(repository);
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);

    const result = await processor.addItemToCart(CartId.generate(), item, UserAccountId.generate())();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ProcessInternalError);
    }
  });

  it("converts domain errors into internal errors", async () => {
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();
    const [cart] = Cart.create(cartId, CartName.of("sample"), executorId);
    const deletedResult = cart.delete(executorId);
    const deletedCart = E.isRight(deletedResult) ? deletedResult.right[0] : cart;
    const findById = jest.fn<ReturnType<CartRepository["findById"]>, Parameters<CartRepository["findById"]>>(() =>
      TE.right(deletedCart),
    );
    const { repository } = createRepository({ findById });
    const processor = CartCommandProcessor.of(repository);
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);

    const result = await processor.addItemToCart(cartId, item, executorId)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ProcessInternalError);
    }
  });
});
