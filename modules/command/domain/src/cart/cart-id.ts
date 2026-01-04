import * as Infrastructure from "cqrs-es-spec-kit-js-infrastructure";
import type { AggregateId } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as U from "ulidx";

const CART_PREFIX = "Cart";
const CartIdTypeSymbol = Symbol("CartId");

class CartId implements AggregateId {
  readonly symbol: typeof CartIdTypeSymbol = CartIdTypeSymbol;
  readonly typeName = CART_PREFIX;

  private constructor(public readonly value: string) {}

  toJSON() {
    return {
      value: this.value,
    };
  }

  equals(anotherId: CartId): boolean {
    return this.value === anotherId.value;
  }

  asString(): string {
    return `${CART_PREFIX}-${this.value}`;
  }

  toString(): string {
    return `CartId(${this.value})`;
  }

  static validate(value: string): E.Either<string, CartId> {
    try {
      return E.right(CartId.of(value));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }

  static of(value: string): CartId {
    const ulid = value.startsWith(`${CART_PREFIX}-`) ? value.substring(CART_PREFIX.length + 1) : value;
    if (U.isValid(ulid)) {
      return new CartId(ulid);
    }
    throw new Error("Invalid cart id");
  }

  static generate(): CartId {
    return new CartId(Infrastructure.generateULID());
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToCartId(json: any): CartId {
  return CartId.of(json.value);
}

export { CartId, CartIdTypeSymbol, convertJSONToCartId };
