import {
  Cart,
  CartAddItemError,
  CartDeleteError,
  type CartEvent,
  CartId,
  type CartItem,
  type CartItemId,
  type CartName,
  CartRemoveItemError,
  type UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { type CartRepository, RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import type * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

class CartCommandProcessor {
  private constructor(private readonly cartRepository: CartRepository) {}

  createCart(name: CartName, executorId: UserAccountId): TE.TaskEither<ProcessError, CartEvent> {
    return pipe(
      TE.right(CartId.generate()),
      TE.chain((id) => TE.right(Cart.create(id, name, executorId))),
      TE.chain(([cart, cartCreated]) =>
        pipe(
          this.cartRepository.store(cartCreated, cart),
          TE.map(() => cartCreated),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  addItemToCart(id: CartId, item: CartItem, executorId: UserAccountId): TE.TaskEither<ProcessError, CartEvent> {
    return this.executeCartCommand(id, (cart) => cart.addItem(item, executorId));
  }

  removeItemFromCart(
    id: CartId,
    itemId: CartItemId,
    executorId: UserAccountId,
  ): TE.TaskEither<ProcessError, CartEvent> {
    return this.executeCartCommand(id, (cart) => cart.removeItem(itemId, executorId));
  }

  deleteCart(id: CartId, executorId: UserAccountId): TE.TaskEither<ProcessError, CartEvent> {
    return this.executeCartCommand(id, (cart) => cart.delete(executorId));
  }

  static of(cartRepository: CartRepository): CartCommandProcessor {
    return new CartCommandProcessor(cartRepository);
  }

  private executeCartCommand<Evt extends CartEvent>(
    id: CartId,
    operation: (cart: Cart) => E.Either<Error, [Cart, Evt]>,
  ): TE.TaskEither<ProcessError, Evt> {
    return pipe(
      this.cartRepository.findById(id),
      TE.chainW(this.getOrError),
      TE.chainW((cart) =>
        pipe(
          TE.fromEither(operation(cart)),
          TE.chainW(([updatedCart, event]) =>
            pipe(
              this.cartRepository.store(event, updatedCart),
              TE.map(() => event),
            ),
          ),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  private convertToProcessError(e: unknown): ProcessError {
    if (e instanceof ProcessError) {
      return e;
    }
    if (e instanceof RepositoryError) {
      return new ProcessInternalError("Repository operation failed", e);
    }
    if (e instanceof CartDeleteError) {
      return new ProcessInternalError("Failed to delete cart", e);
    }
    if (e instanceof CartAddItemError) {
      return new ProcessInternalError("Failed to add item to cart", e);
    }
    if (e instanceof CartRemoveItemError) {
      return new ProcessInternalError("Failed to remove item from cart", e);
    }
    throw e;
  }

  private getOrError(cartOpt: Cart | undefined): TE.TaskEither<ProcessError, Cart> {
    return cartOpt === undefined ? TE.left(new ProcessNotFoundError("Cart not found")) : TE.right(cartOpt);
  }
}

abstract class ProcessError extends Error {}

class ProcessInternalError extends ProcessError {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "ProcessInternalError";
    this.cause = cause;
  }
}

class ProcessNotFoundError extends ProcessError {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "ProcessNotFoundError";
    this.cause = cause;
  }
}

export { CartCommandProcessor, ProcessError, ProcessInternalError, ProcessNotFoundError };
