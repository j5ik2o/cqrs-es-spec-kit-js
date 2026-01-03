abstract class OrderError extends Error {}

const OrderAddItemErrorTypeSymbol = Symbol("OrderAddItemError");

class OrderAddItemError extends OrderError {
  symbol: typeof OrderAddItemErrorTypeSymbol = OrderAddItemErrorTypeSymbol;

  private constructor(message: string, cause?: Error) {
    super(message, cause);
  }

  static of(message: string, cause?: Error): OrderAddItemError {
    return new OrderAddItemError(message, cause);
  }
}

const OrderRemoveItemErrorTypeSymbol = Symbol("OrderRemoveItemError");

class OrderRemoveItemError extends OrderError {
  symbol: typeof OrderRemoveItemErrorTypeSymbol = OrderRemoveItemErrorTypeSymbol;

  private constructor(message: string, cause?: Error) {
    super(message, cause);
  }

  static of(message: string, cause?: Error): OrderRemoveItemError {
    return new OrderRemoveItemError(message, cause);
  }
}

const OrderDeleteErrorTypeSymbol = Symbol("OrderDeleteError");

class OrderDeleteError extends Error {
  readonly symbol: typeof OrderDeleteErrorTypeSymbol = OrderDeleteErrorTypeSymbol;

  private constructor(message: string, cause?: Error) {
    super(message);
    this.name = "OrderDeleteError";
    this.cause = cause;
  }

  static of(message: string): OrderDeleteError {
    return new OrderDeleteError(message);
  }
}

export {
  OrderError,
  OrderAddItemError,
  OrderAddItemErrorTypeSymbol,
  OrderRemoveItemError,
  OrderRemoveItemErrorTypeSymbol,
  OrderDeleteError,
  OrderDeleteErrorTypeSymbol,
};
