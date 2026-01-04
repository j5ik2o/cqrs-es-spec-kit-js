import * as E from "fp-ts/lib/Either";
import { CartItem } from "./cart-item";
import { CartItemId } from "./cart-item-id";

describe("CartItem", () => {
  it("creates an item and calculates totals", () => {
    const id = CartItemId.generate();
    const item = CartItem.of(id, "apple", 2, 150);

    expect(item.id.equals(id)).toBe(true);
    expect(item.totalPrice()).toBe(300);

    const updated = item.withQuantity(3);
    expect(updated.quantity).toBe(3);
    expect(updated.id.equals(item.id)).toBe(true);
  });

  it("compares by id", () => {
    const id = CartItemId.generate();
    const itemA = CartItem.of(id, "apple", 1, 100);
    const itemB = CartItem.of(id, "banana", 2, 50);
    const other = CartItem.of(CartItemId.generate(), "apple", 1, 100);

    expect(itemA.equals(itemB)).toBe(true);
    expect(itemA.equals(other)).toBe(false);
  });

  it("validates fields", () => {
    const id = CartItemId.generate();

    expect(E.isLeft(CartItem.validate(id, "", 1, 100))).toBe(true);
    expect(E.isLeft(CartItem.validate(id, "apple", 0, 100))).toBe(true);
    expect(E.isLeft(CartItem.validate(id, "apple", 1, -1))).toBe(true);
    expect(E.isRight(CartItem.validate(id, "apple", 1, 100))).toBe(true);
  });
});
