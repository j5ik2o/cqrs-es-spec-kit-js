import * as O from "fp-ts/lib/Option";
import { CartItem } from "./cart-item";
import { CartItemId } from "./cart-item-id";
import { CartItems } from "./cart-items";

describe("CartItems", () => {
  it("adds and removes items", () => {
    const first = CartItem.of(CartItemId.generate(), "apple", 1, 100);
    const second = CartItem.of(CartItemId.generate(), "banana", 2, 50);

    const items = CartItems.empty().addItem(first).addItem(second);
    expect(items.size()).toBe(2);
    expect(items.containsById(first.id)).toBe(true);

    const removed = items.removeItemById(first.id);
    expect(O.isSome(removed)).toBe(true);
    if (O.isSome(removed)) {
      const [next, removedItem] = removed.value;
      expect(removedItem.equals(first)).toBe(true);
      expect(next.size()).toBe(1);
      expect(next.containsById(first.id)).toBe(false);
    }
  });

  it("returns none when removing missing items", () => {
    const items = CartItems.empty();
    const result = items.removeItemById(CartItemId.generate());

    expect(O.isNone(result)).toBe(true);
  });

  it("calculates totals and equality", () => {
    const first = CartItem.of(CartItemId.generate(), "apple", 2, 100);
    const second = CartItem.of(CartItemId.generate(), "banana", 1, 50);

    const items = CartItems.fromArray([first, second]);
    const mapItems = CartItems.fromMap(items.toMap());

    expect(items.totalPrice()).toBe(250);
    expect(items.isEmpty()).toBe(false);
    expect(items.equals(mapItems)).toBe(true);
    expect(items.toString()).toContain("CartItems(");
  });
});
