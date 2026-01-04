import * as O from "fp-ts/lib/Option";
import { type CartItem, convertJSONToCartItem } from "./cart-item";
import { CartItemId } from "./cart-item-id";

const CartItemsTypeSymbol = Symbol("CartItems");

class CartItems {
  readonly symbol: typeof CartItemsTypeSymbol = CartItemsTypeSymbol;

  private constructor(public readonly values: Map<string, CartItem>) {}

  toJSON() {
    return {
      values: this.toArray().map((item) => item.toJSON()),
    };
  }

  addItem(item: CartItem): CartItems {
    return new CartItems(new Map(this.values).set(item.id.value, item));
  }

  removeItemById(itemId: CartItemId): O.Option<[CartItems, CartItem]> {
    const item = this.values.get(itemId.value);
    if (item === undefined) {
      return O.none;
    }
    const newMap = new Map(this.values);
    newMap.delete(itemId.value);
    return O.some([new CartItems(newMap), item]);
  }

  containsById(itemId: CartItemId): boolean {
    return this.values.has(itemId.value);
  }

  findById(itemId: CartItemId): CartItem | undefined {
    return this.values.get(itemId.value);
  }

  toArray(): CartItem[] {
    return Array.from(this.values.values());
  }

  toMap(): Map<CartItemId, CartItem> {
    return new Map(Array.from(this.values, ([key, value]) => [CartItemId.of(key), value]));
  }

  totalPrice(): number {
    return this.toArray().reduce((sum, item) => sum + item.totalPrice(), 0);
  }

  size(): number {
    return this.values.size;
  }

  isEmpty(): boolean {
    return this.values.size === 0;
  }

  toString(): string {
    return `CartItems(${JSON.stringify(this.toArray().map((item) => item.toString()))})`;
  }

  equals(other: CartItems): boolean {
    const values = this.toMap();
    if (values.size !== other.toMap().size) {
      return false;
    }
    for (const [key, value] of values) {
      const otherValue = other.values.get(key.value);
      if (otherValue === undefined || !value.equals(otherValue)) {
        return false;
      }
    }
    return true;
  }

  static empty(): CartItems {
    return new CartItems(new Map());
  }

  static fromArray(items: CartItem[]): CartItems {
    const map = new Map(items.map((item) => [item.id.value, item]));
    return new CartItems(map);
  }

  static fromMap(values: Map<CartItemId, CartItem>): CartItems {
    return new CartItems(new Map(Array.from(values, ([itemId, item]) => [itemId.value, item])));
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToCartItems(json: any): CartItems {
  const items = json.values.map(convertJSONToCartItem);
  return CartItems.fromArray(items);
}

export { CartItems, CartItemsTypeSymbol, convertJSONToCartItems };
