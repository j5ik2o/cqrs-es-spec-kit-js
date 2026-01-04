import "reflect-metadata";
import {
  CartCreated,
  CartItemAdded,
  CartItemId,
  CartName,
  UserAccountId,
  CartId,
  CartItem,
  CartAddItemError,
} from "cqrs-es-spec-kit-js-command-domain";
import { RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import {
  CartCommandProcessor,
  ProcessInternalError,
  ProcessNotFoundError,
} from "cqrs-es-spec-kit-js-command-processor";
import { OptimisticLockError } from "event-store-adapter-js";
import * as TE from "fp-ts/TaskEither";
import { CartCommandResolver } from "./resolvers";
import type { CommandContext } from "./resolvers";

type ProcessorOverrides = Partial<{
  createCart: CartCommandProcessor["createCart"];
  addItemToCart: CartCommandProcessor["addItemToCart"];
  removeItemFromCart: CartCommandProcessor["removeItemFromCart"];
  deleteCart: CartCommandProcessor["deleteCart"];
}>;

const createProcessor = (overrides: ProcessorOverrides = {}) => {
  const processor = {
    createCart: () => TE.left(new ProcessInternalError("not implemented")),
    addItemToCart: () => TE.left(new ProcessInternalError("not implemented")),
    removeItemFromCart: () => TE.left(new ProcessInternalError("not implemented")),
    deleteCart: () => TE.left(new ProcessInternalError("not implemented")),
    ...overrides,
  } as CartCommandProcessor;

  return processor;
};

describe("CartCommandResolver", () => {
  it("returns health check", async () => {
    const resolver = new CartCommandResolver();

    await expect(resolver.healthCheck()).resolves.toEqual({ value: "OK" });
  });

  it("creates an cart", async () => {
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();
    const event = CartCreated.of(cartId, CartName.of("sample"), executorId, 1);
    const processor = createProcessor({
      createCart: () => TE.right(event),
    });
    const resolver = new CartCommandResolver();

    const result = await resolver.createCart(
      { cartCommandProcessor: processor } as CommandContext,
      { name: "sample", executorId: executorId.asString() },
    );

    expect(result.cartId).toBe(cartId.asString());
  });

  it("adds an item", async () => {
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);
    const event = CartItemAdded.of(cartId, item, executorId, 2);
    const processor = createProcessor({
      addItemToCart: () => TE.right(event),
    });
    const resolver = new CartCommandResolver();

    const result = await resolver.addItemToCart(
      { cartCommandProcessor: processor } as CommandContext,
      { cartId: cartId.asString(), name: "item", quantity: 1, price: 100, executorId: executorId.asString() },
    );

    expect(result.cartId).toBe(cartId.asString());
    expect(result.itemId.startsWith("CartItem-")).toBe(true);
  });

  it("returns validation errors for invalid input", async () => {
    const resolver = new CartCommandResolver();

    await expect(
      resolver.deleteCart(
        { cartCommandProcessor: createProcessor() } as CommandContext,
        { cartId: "invalid", executorId: "invalid" },
      ),
    ).rejects.toMatchObject({ extensions: { code: "400" } });
  });

  it("maps not found errors", async () => {
    const processor = createProcessor({
      removeItemFromCart: () => TE.left(new ProcessNotFoundError("not found")),
    });
    const resolver = new CartCommandResolver();

    await expect(
      resolver.removeItemFromCart(
        { cartCommandProcessor: processor } as CommandContext,
        { cartId: CartId.generate().asString(), itemId: CartItemId.generate().asString(), executorId: UserAccountId.generate().asString() },
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
      deleteCart: () => TE.left(error),
    });
    const resolver = new CartCommandResolver();

    await expect(
      resolver.deleteCart(
        { cartCommandProcessor: processor } as CommandContext,
        { cartId: CartId.generate().asString(), executorId: UserAccountId.generate().asString() },
      ),
    ).rejects.toMatchObject({ extensions: { code: "409" } });
  });

  it("maps domain errors", async () => {
    const error = new ProcessInternalError(
      "domain",
      CartAddItemError.of("invalid"),
    );
    const processor = createProcessor({
      createCart: () => TE.left(error),
    });
    const resolver = new CartCommandResolver();

    await expect(
      resolver.createCart(
        { cartCommandProcessor: processor } as CommandContext,
        { name: "sample", executorId: UserAccountId.generate().asString() },
      ),
    ).rejects.toMatchObject({ extensions: { code: "422" } });
  });
});
