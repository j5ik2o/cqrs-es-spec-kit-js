import * as E from "fp-ts/lib/Either";
import { Order } from "./order";
import { OrderId } from "./order-id";
import { OrderItem } from "./order-item";
import { OrderItemId } from "./order-item-id";
import { OrderName } from "./order-name";
import { OrderCreated, OrderItemAdded, OrderItemRemoved, OrderDeleted } from "./order-events";
import { UserAccountId } from "../user-account/user-account-id";

describe("Order", () => {
  it("creates and applies item events", () => {
    const orderId = OrderId.generate();
    const userId = UserAccountId.generate();
    const name = OrderName.of("sample");
    const [order, createdEvent] = Order.create(orderId, name, userId);

    expect(createdEvent).toBeInstanceOf(OrderCreated);
    expect(order.name.equals(name)).toBe(true);

    const item = OrderItem.of(OrderItemId.generate(), "apple", 2, 100);
    const added = order.addItem(item, userId);
    expect(E.isRight(added)).toBe(true);

    if (E.isRight(added)) {
      const [updated, event] = added.right;
      expect(event).toBeInstanceOf(OrderItemAdded);
      expect(updated.items.containsById(item.id)).toBe(true);
    }
  });

  it("removes items and handles missing items", () => {
    const orderId = OrderId.generate();
    const userId = UserAccountId.generate();
    const name = OrderName.of("sample");
    const [order] = Order.create(orderId, name, userId);
    const itemId = OrderItemId.generate();

    const missing = order.removeItem(itemId, userId);
    expect(E.isLeft(missing)).toBe(true);

    const item = OrderItem.of(itemId, "apple", 1, 100);
    const added = order.addItem(item, userId);
    if (E.isRight(added)) {
      const [withItem] = added.right;
      const removed = withItem.removeItem(itemId, userId);
      expect(E.isRight(removed)).toBe(true);
      if (E.isRight(removed)) {
        const [withoutItem, event] = removed.right;
        expect(event).toBeInstanceOf(OrderItemRemoved);
        expect(withoutItem.items.containsById(itemId)).toBe(false);
      }
    }
  });

  it("deletes orders and rejects invalid operations", () => {
    const orderId = OrderId.generate();
    const userId = UserAccountId.generate();
    const [order] = Order.create(orderId, OrderName.of("sample"), userId);

    const deleted = order.delete(userId);
    expect(E.isRight(deleted)).toBe(true);

    if (E.isRight(deleted)) {
      const [deletedOrder, event] = deleted.right;
      expect(event).toBeInstanceOf(OrderDeleted);

      const again = deletedOrder.delete(userId);
      expect(E.isLeft(again)).toBe(true);

      const addOnDeleted = deletedOrder.addItem(
        OrderItem.of(OrderItemId.generate(), "apple", 1, 100),
        userId,
      );
      expect(E.isLeft(addOnDeleted)).toBe(true);
    }
  });

  it("replays events and rejects unknown event", () => {
    const orderId = OrderId.generate();
    const userId = UserAccountId.generate();
    const [order] = Order.create(orderId, OrderName.of("sample"), userId);
    const item = OrderItem.of(OrderItemId.generate(), "apple", 1, 100);
    const added = OrderItemAdded.of(orderId, item, userId, order.sequenceNumber + 1);
    const deleted = OrderDeleted.of(orderId, userId, order.sequenceNumber + 2);

    const replayed = Order.replay([added, deleted], order);
    expect(replayed.deleted).toBe(true);
    expect(replayed.items.containsById(item.id)).toBe(true);

    const unknownEvent = {
      symbol: Symbol("Unknown"),
    } as unknown as OrderItemAdded;
    expect(() => order.applyEvent(unknownEvent)).toThrow("Unknown event");
  });
});
