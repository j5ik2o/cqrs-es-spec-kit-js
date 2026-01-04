abstract class CartError extends Error {}

const CartAddItemErrorTypeSymbol = Symbol("CartAddItemError");

class CartAddItemError extends CartError {
  symbol: typeof CartAddItemErrorTypeSymbol = CartAddItemErrorTypeSymbol;

  private constructor(message: string, cause?: Error) {
    super(message, cause);
  }

  static of(message: string, cause?: Error): CartAddItemError {
    return new CartAddItemError(message, cause);
  }
}

const CartRemoveItemErrorTypeSymbol = Symbol("CartRemoveItemError");

class CartRemoveItemError extends CartError {
  symbol: typeof CartRemoveItemErrorTypeSymbol = CartRemoveItemErrorTypeSymbol;

  private constructor(message: string, cause?: Error) {
    super(message, cause);
  }

  static of(message: string, cause?: Error): CartRemoveItemError {
    return new CartRemoveItemError(message, cause);
  }
}

const CartDeleteErrorTypeSymbol = Symbol("CartDeleteError");

class CartDeleteError extends Error {
  readonly symbol: typeof CartDeleteErrorTypeSymbol = CartDeleteErrorTypeSymbol;

  private constructor(message: string, cause?: Error) {
    super(message);
    this.name = "CartDeleteError";
    this.cause = cause;
  }

  static of(message: string): CartDeleteError {
    return new CartDeleteError(message);
  }
}

export {
  CartError,
  CartAddItemError,
  CartAddItemErrorTypeSymbol,
  CartRemoveItemError,
  CartRemoveItemErrorTypeSymbol,
  CartDeleteError,
  CartDeleteErrorTypeSymbol,
};
