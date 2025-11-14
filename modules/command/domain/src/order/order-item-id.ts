import * as Infrastructure from "cqrs-es-spec-kit-js-infrastructure";
import * as E from "fp-ts/lib/Either";
import * as U from "ulidx";

const ORDER_ITEM_PREFIX = "OrderItem";
const OrderItemIdTypeSymbol = Symbol("OrderItemId");

class OrderItemId {
  readonly symbol: typeof OrderItemIdTypeSymbol = OrderItemIdTypeSymbol;
  readonly typeName = ORDER_ITEM_PREFIX;

  private constructor(public readonly value: string) {}

  toJSON() {
    return {
      value: this.value,
    };
  }

  equals(anotherId: OrderItemId): boolean {
    return this.value === anotherId.value;
  }

  asString(): string {
    return `${ORDER_ITEM_PREFIX}-${this.value}`;
  }

  toString(): string {
    return `OrderItemId(${this.value})`;
  }

  static validate(value: string): E.Either<string, OrderItemId> {
    try {
      return E.right(OrderItemId.of(value));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }

  static of(value: string): OrderItemId {
    const ulid = value.startsWith(`${ORDER_ITEM_PREFIX}-`)
      ? value.substring(ORDER_ITEM_PREFIX.length + 1)
      : value;
    if (U.isValid(ulid)) {
      return new OrderItemId(ulid);
    }
    throw new Error("Invalid order item id");
  }

  static generate(): OrderItemId {
    return new OrderItemId(Infrastructure.generateULID());
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToOrderItemId(json: any): OrderItemId {
  return OrderItemId.of(json.value);
}

export { OrderItemId, OrderItemIdTypeSymbol, convertJSONToOrderItemId };
