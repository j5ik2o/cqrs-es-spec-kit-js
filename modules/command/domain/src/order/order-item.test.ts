import * as E from "fp-ts/lib/Either";
import { OrderItem } from "./order-item";
import { OrderItemId } from "./order-item-id";

describe("OrderItem", () => {
  it("creates an item and calculates totals", () => {
    const id = OrderItemId.generate();
    const item = OrderItem.of(id, "apple", 2, 150);

    expect(item.id.equals(id)).toBe(true);
    expect(item.totalPrice()).toBe(300);

    const updated = item.withQuantity(3);
    expect(updated.quantity).toBe(3);
    expect(updated.id.equals(item.id)).toBe(true);
  });

  it("compares by id", () => {
    const id = OrderItemId.generate();
    const itemA = OrderItem.of(id, "apple", 1, 100);
    const itemB = OrderItem.of(id, "banana", 2, 50);
    const other = OrderItem.of(OrderItemId.generate(), "apple", 1, 100);

    expect(itemA.equals(itemB)).toBe(true);
    expect(itemA.equals(other)).toBe(false);
  });

  it("validates fields", () => {
    const id = OrderItemId.generate();

    expect(E.isLeft(OrderItem.validate(id, "", 1, 100))).toBe(true);
    expect(E.isLeft(OrderItem.validate(id, "apple", 0, 100))).toBe(true);
    expect(E.isLeft(OrderItem.validate(id, "apple", 1, -1))).toBe(true);
    expect(E.isRight(OrderItem.validate(id, "apple", 1, 100))).toBe(true);
  });
});
