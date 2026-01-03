import * as O from "fp-ts/lib/Option";
import { OrderItem } from "./order-item";
import { OrderItemId } from "./order-item-id";
import { OrderItems } from "./order-items";

describe("OrderItems", () => {
  it("adds and removes items", () => {
    const first = OrderItem.of(OrderItemId.generate(), "apple", 1, 100);
    const second = OrderItem.of(OrderItemId.generate(), "banana", 2, 50);

    const items = OrderItems.empty().addItem(first).addItem(second);
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
    const items = OrderItems.empty();
    const result = items.removeItemById(OrderItemId.generate());

    expect(O.isNone(result)).toBe(true);
  });

  it("calculates totals and equality", () => {
    const first = OrderItem.of(OrderItemId.generate(), "apple", 2, 100);
    const second = OrderItem.of(OrderItemId.generate(), "banana", 1, 50);

    const items = OrderItems.fromArray([first, second]);
    const mapItems = OrderItems.fromMap(items.toMap());

    expect(items.totalPrice()).toBe(250);
    expect(items.isEmpty()).toBe(false);
    expect(items.equals(mapItems)).toBe(true);
    expect(items.toString()).toContain("OrderItems(");
  });
});
