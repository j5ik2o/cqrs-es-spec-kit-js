import {
  OrderAddItemError,
  OrderAddItemErrorTypeSymbol,
  OrderDeleteError,
  OrderDeleteErrorTypeSymbol,
  OrderError,
  OrderRemoveItemError,
  OrderRemoveItemErrorTypeSymbol,
} from "./order-errors";

describe("order-errors", () => {
  it("creates add/remove errors with symbols", () => {
    const addError = OrderAddItemError.of("add failed");
    const removeError = OrderRemoveItemError.of("remove failed");

    expect(addError).toBeInstanceOf(OrderError);
    expect(addError.symbol).toBe(OrderAddItemErrorTypeSymbol);
    expect(addError.message).toBe("add failed");

    expect(removeError).toBeInstanceOf(OrderError);
    expect(removeError.symbol).toBe(OrderRemoveItemErrorTypeSymbol);
    expect(removeError.message).toBe("remove failed");
  });

  it("creates delete error with name and symbol", () => {
    const error = OrderDeleteError.of("delete failed");

    expect(error.name).toBe("OrderDeleteError");
    expect(error.symbol).toBe(OrderDeleteErrorTypeSymbol);
    expect(error.message).toBe("delete failed");
  });
});
