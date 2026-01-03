import {
  OrderCreated,
  OrderDeleted,
  OrderItemAdded,
  OrderItemRemoved,
  convertJSONToOrderEvent,
} from "./order-events";
import { OrderId } from "./order-id";
import { OrderItem } from "./order-item";
import { OrderItemId } from "./order-item-id";
import { OrderName } from "./order-name";
import { UserAccountId } from "../user-account/user-account-id";

describe("order-events", () => {
  it("creates events with expected flags", () => {
    const orderId = OrderId.generate();
    const userId = UserAccountId.generate();
    const name = OrderName.of("sample");
    const item = OrderItem.of(OrderItemId.generate(), "apple", 1, 100);

    const created = OrderCreated.of(orderId, name, userId, 1);
    const added = OrderItemAdded.of(orderId, item, userId, 2);
    const removed = OrderItemRemoved.of(orderId, item, userId, 3);
    const deleted = OrderDeleted.of(orderId, userId, 4);

    expect(created.isCreated).toBe(true);
    expect(added.isCreated).toBe(false);
    expect(removed.isCreated).toBe(false);
    expect(deleted.isCreated).toBe(false);
    expect(created.toString()).toContain("OrderCreated(");
  });

  it("converts JSON payloads to events", () => {
    const orderId = OrderId.generate();
    const userId = UserAccountId.generate();
    const name = OrderName.of("sample");
    const item = OrderItem.of(OrderItemId.generate(), "apple", 1, 100);

    const createdJson = {
      type: "OrderCreated",
      data: {
        aggregateId: orderId.toJSON(),
        name: name.toJSON(),
        executorId: userId.toJSON(),
        sequenceNumber: 1,
      },
    };
    const created = convertJSONToOrderEvent(createdJson);
    expect(created.typeName).toBe("OrderCreated");
    expect(created.aggregateId.equals(orderId)).toBe(true);

    const addedJson = {
      type: "OrderItemAdded",
      data: {
        aggregateId: orderId.toJSON(),
        item: item.toJSON(),
        executorId: userId.toJSON(),
        sequenceNumber: 2,
      },
    };
    const added = convertJSONToOrderEvent(addedJson);
    expect(added.typeName).toBe("OrderItemAdded");
    expect(added.aggregateId.equals(orderId)).toBe(true);

    const removedJson = {
      type: "OrderItemRemoved",
      data: {
        aggregateId: orderId.toJSON(),
        item: item.toJSON(),
        executorId: userId.toJSON(),
        sequenceNumber: 3,
      },
    };
    const removed = convertJSONToOrderEvent(removedJson);
    expect(removed.typeName).toBe("OrderItemRemoved");
    expect(removed.aggregateId.equals(orderId)).toBe(true);

    const deletedJson = {
      type: "OrderDeleted",
      data: {
        aggregateId: orderId.toJSON(),
        executorId: userId.toJSON(),
        sequenceNumber: 4,
      },
    };
    const deleted = convertJSONToOrderEvent(deletedJson);
    expect(deleted.typeName).toBe("OrderDeleted");
    expect(deleted.aggregateId.equals(orderId)).toBe(true);
  });
});
