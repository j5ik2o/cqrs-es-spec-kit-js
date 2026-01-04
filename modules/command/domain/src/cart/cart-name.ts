import * as E from "fp-ts/lib/Either";

const CartNameTypeSymbol = Symbol("CartName");

class CartName {
  readonly symbol: typeof CartNameTypeSymbol = CartNameTypeSymbol;

  private constructor(public readonly value: string) {
    if (this.value.length === 0) {
      throw new Error("Cart name cannot be empty");
    }
    if (this.value.length > 200) {
      throw new Error("Cart name cannot be longer than 200 characters");
    }
  }

  toJSON() {
    return {
      value: this.value,
    };
  }

  asString(): string {
    return this.value;
  }

  toString(): string {
    return `CartName(${this.value})`;
  }

  equals(anotherName: CartName): boolean {
    return this.value === anotherName.value;
  }

  static validate(value: string): E.Either<string, CartName> {
    try {
      return E.right(CartName.of(value));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }

  static of(value: string): CartName {
    return new CartName(value);
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToCartName(json: any): CartName {
  return CartName.of(json.value);
}

export { CartName, CartNameTypeSymbol, convertJSONToCartName };
