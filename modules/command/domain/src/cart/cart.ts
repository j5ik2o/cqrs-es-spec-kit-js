import type { Aggregate } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import type { UserAccountId } from "../user-account";
import { CartAddItemError, CartDeleteError, CartRemoveItemError } from "./cart-errors";
import {
  CartCreated,
  CartDeleted,
  CartDeletedTypeSymbol,
  type CartEvent,
  CartItemAdded,
  CartItemAddedTypeSymbol,
  CartItemRemoved,
  CartItemRemovedTypeSymbol,
} from "./cart-events";
import { type CartId, convertJSONToCartId } from "./cart-id";
import type { CartItem } from "./cart-item";
import type { CartItemId } from "./cart-item-id";
import { CartItems, convertJSONToCartItems } from "./cart-items";
import { type CartName, convertJSONToCartName } from "./cart-name";

const CartTypeSymbol = Symbol("Cart");

interface CartParams {
  id: CartId;
  deleted: boolean;
  name: CartName;
  items: CartItems;
  sequenceNumber: number;
  version: number;
}

class Cart implements Aggregate<Cart, CartId> {
  readonly symbol: typeof CartTypeSymbol = CartTypeSymbol;
  readonly typeName = "Cart";

  public readonly id: CartId;
  public readonly deleted: boolean;
  public readonly name: CartName;
  public readonly items: CartItems;
  public readonly sequenceNumber: number;
  public readonly version: number;

  private constructor(params: CartParams) {
    this.id = params.id;
    this.deleted = params.deleted;
    this.name = params.name;
    this.items = params.items;
    this.sequenceNumber = params.sequenceNumber;
    this.version = params.version;
  }

  toJSON() {
    return {
      id: this.id.toJSON(),
      deleted: this.deleted,
      name: this.name.toJSON(),
      items: this.items.toJSON(),
      sequenceNumber: this.sequenceNumber,
      version: this.version,
    };
  }

  addItem(item: CartItem, executorId: UserAccountId): E.Either<CartAddItemError, [Cart, CartItemAdded]> {
    if (this.deleted) {
      return E.left(CartAddItemError.of("The cart is deleted"));
    }

    const newItems = this.items.addItem(item);
    const newSequenceNumber = this.sequenceNumber + 1;
    const newCart: Cart = new Cart({
      ...this,
      items: newItems,
      sequenceNumber: newSequenceNumber,
    });

    const event = CartItemAdded.of(this.id, item, executorId, newSequenceNumber);

    return E.right([newCart, event]);
  }

  removeItem(
    itemId: CartItemId,
    executorId: UserAccountId,
  ): E.Either<CartRemoveItemError, [Cart, CartItemRemoved]> {
    if (this.deleted) {
      return E.left(CartRemoveItemError.of("The cart is deleted"));
    }

    if (!this.items.containsById(itemId)) {
      return E.left(CartRemoveItemError.of("The item does not exist"));
    }

    const removedItemOpt = this.items.removeItemById(itemId);
    if (O.isNone(removedItemOpt)) {
      return E.left(CartRemoveItemError.of("The item does not exist"));
    }

    const [newItems, removedItem] = removedItemOpt.value;
    const newSequenceNumber = this.sequenceNumber + 1;
    const newCart: Cart = new Cart({
      ...this,
      items: newItems,
      sequenceNumber: newSequenceNumber,
    });

    const event = CartItemRemoved.of(this.id, removedItem, executorId, newSequenceNumber);

    return E.right([newCart, event]);
  }

  delete(executorId: UserAccountId): E.Either<CartDeleteError, [Cart, CartDeleted]> {
    if (this.deleted) {
      return E.left(CartDeleteError.of("The cart is already deleted"));
    }

    const newSequenceNumber = this.sequenceNumber + 1;
    const newCart: Cart = new Cart({
      ...this,
      deleted: true,
      sequenceNumber: newSequenceNumber,
    });

    const event = CartDeleted.of(this.id, executorId, newSequenceNumber);

    return E.right([newCart, event]);
  }

  withVersion(version: number): Cart {
    return new Cart({ ...this, version });
  }

  updateVersion(versionF: (value: number) => number): Cart {
    return new Cart({ ...this, version: versionF(this.version) });
  }

  withSequenceNumber(sequenceNumber: number): Cart {
    return new Cart({ ...this, sequenceNumber });
  }

  applyEvent(event: CartEvent): Cart {
    switch (event.symbol) {
      case CartItemAddedTypeSymbol: {
        const typedEvent = event as CartItemAdded;
        const result = this.addItem(typedEvent.item, event.executorId);
        if (E.isLeft(result)) {
          throw new Error(result.left.message);
        }
        return result.right[0];
      }
      case CartItemRemovedTypeSymbol: {
        const typedEvent = event as CartItemRemoved;
        const result = this.removeItem(typedEvent.item.id, event.executorId);
        if (E.isLeft(result)) {
          throw new Error(result.left.message);
        }
        return result.right[0];
      }
      case CartDeletedTypeSymbol: {
        const typedEvent = event as CartDeleted;
        const result = this.delete(typedEvent.executorId);
        if (E.isLeft(result)) {
          throw new Error(result.left.message);
        }
        return result.right[0];
      }
      default: {
        throw new Error("Unknown event");
      }
    }
  }

  static replay(events: CartEvent[], snapshot: Cart): Cart {
    return events.reduce((cart, event) => cart.applyEvent(event), snapshot);
  }

  static create(id: CartId, name: CartName, executorId: UserAccountId): [Cart, CartCreated] {
    const sequenceNumber = 1;
    const cart = new Cart({
      id,
      deleted: false,
      name,
      items: CartItems.empty(),
      sequenceNumber,
      version: 1,
    });

    const event = CartCreated.of(id, name, executorId, sequenceNumber);

    return [cart, event];
  }

  static of(params: CartParams): Cart {
    return new Cart(params);
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToCart(json: any): Cart {
  const data = json.data ?? json;
  const id = convertJSONToCartId(data.id);
  const name = convertJSONToCartName(data.name);
  const items = convertJSONToCartItems(data.items);
  return Cart.of({
    id,
    deleted: data.deleted,
    name,
    items,
    sequenceNumber: data.sequenceNumber,
    version: data.version,
  });
}

export { Cart, CartTypeSymbol, convertJSONToCart };
