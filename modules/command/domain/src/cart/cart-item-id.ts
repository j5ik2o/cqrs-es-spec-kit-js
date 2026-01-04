import * as Infrastructure from "cqrs-es-spec-kit-js-infrastructure";
import * as E from "fp-ts/lib/Either";
import * as U from "ulidx";

const CART_ITEM_PREFIX = "CartItem";
const CartItemIdTypeSymbol = Symbol("CartItemId");

class CartItemId {
  readonly symbol: typeof CartItemIdTypeSymbol = CartItemIdTypeSymbol;
  readonly typeName = CART_ITEM_PREFIX;

  private constructor(public readonly value: string) {}

  toJSON() {
    return {
      value: this.value,
    };
  }

  equals(anotherId: CartItemId): boolean {
    return this.value === anotherId.value;
  }

  asString(): string {
    return `${CART_ITEM_PREFIX}-${this.value}`;
  }

  toString(): string {
    return `CartItemId(${this.value})`;
  }

  static validate(value: string): E.Either<string, CartItemId> {
    try {
      return E.right(CartItemId.of(value));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }

  static of(value: string): CartItemId {
    const ulid = value.startsWith(`${CART_ITEM_PREFIX}-`) ? value.substring(CART_ITEM_PREFIX.length + 1) : value;
    if (U.isValid(ulid)) {
      return new CartItemId(ulid);
    }
    throw new Error("Invalid cart item id");
  }

  static generate(): CartItemId {
    return new CartItemId(Infrastructure.generateULID());
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToCartItemId(json: any): CartItemId {
  return CartItemId.of(json.value);
}

export { CartItemId, CartItemIdTypeSymbol, convertJSONToCartItemId };
