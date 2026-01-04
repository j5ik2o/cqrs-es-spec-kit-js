import * as E from "fp-ts/lib/Either";
import { Cart } from "./cart";
import { CartId } from "./cart-id";
import { CartItem } from "./cart-item";
import { CartItemId } from "./cart-item-id";
import { CartName } from "./cart-name";
import { CartCreated, CartItemAdded, CartItemRemoved, CartDeleted } from "./cart-events";
import { UserAccountId } from "../user-account/user-account-id";

describe("Cart", () => {
  it("creates and applies item events", () => {
    const cartId = CartId.generate();
    const userId = UserAccountId.generate();
    const name = CartName.of("sample");
    const [cart, createdEvent] = Cart.create(cartId, name, userId);

    expect(createdEvent).toBeInstanceOf(CartCreated);
    expect(cart.name.equals(name)).toBe(true);

    const item = CartItem.of(CartItemId.generate(), "apple", 2, 100);
    const added = cart.addItem(item, userId);
    expect(E.isRight(added)).toBe(true);

    if (E.isRight(added)) {
      const [updated, event] = added.right;
      expect(event).toBeInstanceOf(CartItemAdded);
      expect(updated.items.containsById(item.id)).toBe(true);
    }
  });

  it("removes items and handles missing items", () => {
    const cartId = CartId.generate();
    const userId = UserAccountId.generate();
    const name = CartName.of("sample");
    const [cart] = Cart.create(cartId, name, userId);
    const itemId = CartItemId.generate();

    const missing = cart.removeItem(itemId, userId);
    expect(E.isLeft(missing)).toBe(true);

    const item = CartItem.of(itemId, "apple", 1, 100);
    const added = cart.addItem(item, userId);
    if (E.isRight(added)) {
      const [withItem] = added.right;
      const removed = withItem.removeItem(itemId, userId);
      expect(E.isRight(removed)).toBe(true);
      if (E.isRight(removed)) {
        const [withoutItem, event] = removed.right;
        expect(event).toBeInstanceOf(CartItemRemoved);
        expect(withoutItem.items.containsById(itemId)).toBe(false);
      }
    }
  });

  it("deletes carts and rejects invalid operations", () => {
    const cartId = CartId.generate();
    const userId = UserAccountId.generate();
    const [cart] = Cart.create(cartId, CartName.of("sample"), userId);

    const deleted = cart.delete(userId);
    expect(E.isRight(deleted)).toBe(true);

    if (E.isRight(deleted)) {
      const [deletedCart, event] = deleted.right;
      expect(event).toBeInstanceOf(CartDeleted);

      const again = deletedCart.delete(userId);
      expect(E.isLeft(again)).toBe(true);

      const addOnDeleted = deletedCart.addItem(
        CartItem.of(CartItemId.generate(), "apple", 1, 100),
        userId,
      );
      expect(E.isLeft(addOnDeleted)).toBe(true);
    }
  });

  it("replays events and rejects unknown event", () => {
    const cartId = CartId.generate();
    const userId = UserAccountId.generate();
    const [cart] = Cart.create(cartId, CartName.of("sample"), userId);
    const item = CartItem.of(CartItemId.generate(), "apple", 1, 100);
    const added = CartItemAdded.of(cartId, item, userId, cart.sequenceNumber + 1);
    const deleted = CartDeleted.of(cartId, userId, cart.sequenceNumber + 2);

    const replayed = Cart.replay([added, deleted], cart);
    expect(replayed.deleted).toBe(true);
    expect(replayed.items.containsById(item.id)).toBe(true);

    const unknownEvent = {
      symbol: Symbol("Unknown"),
    } as unknown as CartItemAdded;
    expect(() => cart.applyEvent(unknownEvent)).toThrow("Unknown event");
  });
});
