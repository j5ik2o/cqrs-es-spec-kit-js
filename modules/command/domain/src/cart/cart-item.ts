import * as E from "fp-ts/lib/Either";
import { type CartItemId, convertJSONToCartItemId } from "./cart-item-id";

const CartItemTypeSymbol = Symbol("CartItem");

interface CartItemParams {
  id: CartItemId;
  name: string;
  quantity: number;
  price: number;
}

class CartItem {
  readonly symbol: typeof CartItemTypeSymbol = CartItemTypeSymbol;

  public readonly id: CartItemId;
  public readonly name: string;
  public readonly quantity: number;
  public readonly price: number;

  private constructor(params: CartItemParams) {
    if (params.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    if (params.price < 0) {
      throw new Error("Price cannot be negative");
    }
    if (params.name.length === 0) {
      throw new Error("Item name cannot be empty");
    }

    this.id = params.id;
    this.name = params.name;
    this.quantity = params.quantity;
    this.price = params.price;
  }

  toJSON() {
    return {
      id: this.id.toJSON(),
      name: this.name,
      quantity: this.quantity,
      price: this.price,
    };
  }

  totalPrice(): number {
    return this.quantity * this.price;
  }

  withQuantity(quantity: number): CartItem {
    return new CartItem({ ...this, quantity });
  }

  toString(): string {
    return `CartItem(${this.id.toString()}, ${this.name}, ${this.quantity}, ${this.price})`;
  }

  equals(other: CartItem): boolean {
    return this.id.equals(other.id);
  }

  static of(id: CartItemId, name: string, quantity: number, price: number): CartItem {
    return new CartItem({ id, name, quantity, price });
  }

  static validate(id: CartItemId, name: string, quantity: number, price: number): E.Either<string, CartItem> {
    try {
      return E.right(CartItem.of(id, name, quantity, price));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToCartItem(json: any): CartItem {
  const id = convertJSONToCartItemId(json.id);
  return CartItem.of(id, json.name, json.quantity, json.price);
}

export { CartItem, CartItemTypeSymbol, convertJSONToCartItem };
