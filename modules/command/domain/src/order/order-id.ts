import * as Infrastructure from "cqrs-es-spec-kit-js-infrastructure";
import type { AggregateId } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as U from "ulidx";

const ORDER_PREFIX = "Order";
const OrderIdTypeSymbol = Symbol("OrderId");

class OrderId implements AggregateId {
  readonly symbol: typeof OrderIdTypeSymbol = OrderIdTypeSymbol;
  readonly typeName = ORDER_PREFIX;

  private constructor(public readonly value: string) {}

  toJSON() {
    return {
      value: this.value,
    };
  }

  equals(anotherId: OrderId): boolean {
    return this.value === anotherId.value;
  }

  asString(): string {
    return `${ORDER_PREFIX}-${this.value}`;
  }

  toString(): string {
    return `OrderId(${this.value})`;
  }

  static validate(value: string): E.Either<string, OrderId> {
    try {
      return E.right(OrderId.of(value));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }

  static of(value: string): OrderId {
    const ulid = value.startsWith(`${ORDER_PREFIX}-`)
      ? value.substring(ORDER_PREFIX.length + 1)
      : value;
    if (U.isValid(ulid)) {
      return new OrderId(ulid);
    }
    throw new Error("Invalid order id");
  }

  static generate(): OrderId {
    return new OrderId(Infrastructure.generateULID());
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToOrderId(json: any): OrderId {
  return OrderId.of(json.value);
}

export { OrderId, OrderIdTypeSymbol, convertJSONToOrderId };
