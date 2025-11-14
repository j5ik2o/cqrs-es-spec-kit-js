import * as E from "fp-ts/lib/Either";

const OrderNameTypeSymbol = Symbol("OrderName");

class OrderName {
  readonly symbol: typeof OrderNameTypeSymbol = OrderNameTypeSymbol;

  private constructor(public readonly value: string) {
    if (this.value.length === 0) {
      throw new Error("Order name cannot be empty");
    }
    if (this.value.length > 200) {
      throw new Error("Order name cannot be longer than 200 characters");
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
    return `OrderName(${this.value})`;
  }

  equals(anotherName: OrderName): boolean {
    return this.value === anotherName.value;
  }

  static validate(value: string): E.Either<string, OrderName> {
    try {
      return E.right(OrderName.of(value));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }

  static of(value: string): OrderName {
    return new OrderName(value);
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToOrderName(json: any): OrderName {
  return OrderName.of(json.value);
}

export { OrderName, OrderNameTypeSymbol, convertJSONToOrderName };
