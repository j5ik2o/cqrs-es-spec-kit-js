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
    return pipe(
      this.cartRepository.findById(id),
      TE.chainW(this.getOrError),
      TE.chainW((cart) =>
        pipe(
          this.addItemAsync(cart, item, executorId),
          TE.chainW(([cart, cartItemAdded]) =>
            pipe(
              this.cartRepository.store(cartItemAdded, cart),
              TE.map(() => cartItemAdded),
            ),
          ),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  removeItemFromCart(
    id: CartId,
    itemId: CartItemId,
    executorId: UserAccountId,
  ): TE.TaskEither<ProcessError, CartEvent> {
    return pipe(
      this.cartRepository.findById(id),
      TE.chainW(this.getOrError),
      TE.chainW((cart) =>
        pipe(
          this.removeItemAsync(cart, itemId, executorId),
          TE.chainW(([cart, cartItemRemoved]) =>
            pipe(
              this.cartRepository.store(cartItemRemoved, cart),
              TE.map(() => cartItemRemoved),
            ),
          ),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  deleteCart(id: CartId, executorId: UserAccountId): TE.TaskEither<ProcessError, CartEvent> {
    return pipe(
      this.cartRepository.findById(id),
      TE.chainW(this.getOrError),
      TE.chainW((cart) =>
        pipe(
          this.deleteCartAsync(cart, executorId),
          TE.chainW(([cart, cartDeleted]) =>
            pipe(
              this.cartRepository.store(cartDeleted, cart),
              TE.map(() => cartDeleted),
            ),
          ),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  static of(cartRepository: CartRepository): CartCommandProcessor {
    return new CartCommandProcessor(cartRepository);
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

  private addItemAsync(cart: Cart, item: CartItem, executorId: UserAccountId) {
    return TE.fromEither(cart.addItem(item, executorId));
  }

  private removeItemAsync(cart: Cart, itemId: CartItemId, executorId: UserAccountId) {
    return TE.fromEither(cart.removeItem(itemId, executorId));
  }

  private deleteCartAsync(cart: Cart, executorId: UserAccountId) {
    return TE.fromEither(cart.delete(executorId));
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
