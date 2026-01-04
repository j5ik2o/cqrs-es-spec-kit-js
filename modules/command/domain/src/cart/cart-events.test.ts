import {
  CartCreated,
  CartDeleted,
  CartItemAdded,
  CartItemRemoved,
  convertJSONToCartEvent,
} from "./cart-events";
import { CartId } from "./cart-id";
import { CartItem } from "./cart-item";
import { CartItemId } from "./cart-item-id";
import { CartName } from "./cart-name";
import { UserAccountId } from "../user-account/user-account-id";

describe("cart-events", () => {
  it("creates events with expected flags", () => {
    const cartId = CartId.generate();
    const userId = UserAccountId.generate();
    const name = CartName.of("sample");
    const item = CartItem.of(CartItemId.generate(), "apple", 1, 100);

    const created = CartCreated.of(cartId, name, userId, 1);
    const added = CartItemAdded.of(cartId, item, userId, 2);
    const removed = CartItemRemoved.of(cartId, item, userId, 3);
    const deleted = CartDeleted.of(cartId, userId, 4);

    expect(created.isCreated).toBe(true);
    expect(added.isCreated).toBe(false);
    expect(removed.isCreated).toBe(false);
    expect(deleted.isCreated).toBe(false);
    expect(created.toString()).toContain("CartCreated(");
  });

  it("converts JSON payloads to events", () => {
    const cartId = CartId.generate();
    const userId = UserAccountId.generate();
    const name = CartName.of("sample");
    const item = CartItem.of(CartItemId.generate(), "apple", 1, 100);

    const createdJson = {
      type: "CartCreated",
      data: {
        aggregateId: cartId.toJSON(),
        name: name.toJSON(),
        executorId: userId.toJSON(),
        sequenceNumber: 1,
      },
    };
    const created = convertJSONToCartEvent(createdJson);
    expect(created.typeName).toBe("CartCreated");
    expect(created.aggregateId.equals(cartId)).toBe(true);

    const addedJson = {
      type: "CartItemAdded",
      data: {
        aggregateId: cartId.toJSON(),
        item: item.toJSON(),
        executorId: userId.toJSON(),
        sequenceNumber: 2,
      },
    };
    const added = convertJSONToCartEvent(addedJson);
    expect(added.typeName).toBe("CartItemAdded");
    expect(added.aggregateId.equals(cartId)).toBe(true);

    const removedJson = {
      type: "CartItemRemoved",
      data: {
        aggregateId: cartId.toJSON(),
        item: item.toJSON(),
        executorId: userId.toJSON(),
        sequenceNumber: 3,
      },
    };
    const removed = convertJSONToCartEvent(removedJson);
    expect(removed.typeName).toBe("CartItemRemoved");
    expect(removed.aggregateId.equals(cartId)).toBe(true);

    const deletedJson = {
      type: "CartDeleted",
      data: {
        aggregateId: cartId.toJSON(),
        executorId: userId.toJSON(),
        sequenceNumber: 4,
      },
    };
    const deleted = convertJSONToCartEvent(deletedJson);
    expect(deleted.typeName).toBe("CartDeleted");
    expect(deleted.aggregateId.equals(cartId)).toBe(true);
  });
});
