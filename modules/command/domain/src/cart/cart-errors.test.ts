import {
  CartAddItemError,
  CartAddItemErrorTypeSymbol,
  CartDeleteError,
  CartDeleteErrorTypeSymbol,
  CartError,
  CartRemoveItemError,
  CartRemoveItemErrorTypeSymbol,
} from "./cart-errors";

describe("cart-errors", () => {
  it("creates add/remove errors with symbols", () => {
    const addError = CartAddItemError.of("add failed");
    const removeError = CartRemoveItemError.of("remove failed");

    expect(addError).toBeInstanceOf(CartError);
    expect(addError.symbol).toBe(CartAddItemErrorTypeSymbol);
    expect(addError.message).toBe("add failed");

    expect(removeError).toBeInstanceOf(CartError);
    expect(removeError.symbol).toBe(CartRemoveItemErrorTypeSymbol);
    expect(removeError.message).toBe("remove failed");
  });

  it("creates delete error with name and symbol", () => {
    const error = CartDeleteError.of("delete failed");

    expect(error.name).toBe("CartDeleteError");
    expect(error.symbol).toBe(CartDeleteErrorTypeSymbol);
    expect(error.message).toBe("delete failed");
  });
});
