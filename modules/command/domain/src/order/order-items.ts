import * as O from "fp-ts/lib/Option";
import { type OrderItem, convertJSONToOrderItem } from "./order-item";
import { OrderItemId } from "./order-item-id";

const OrderItemsTypeSymbol = Symbol("OrderItems");

class OrderItems {
  readonly symbol: typeof OrderItemsTypeSymbol = OrderItemsTypeSymbol;

  private constructor(public readonly values: Map<string, OrderItem>) {}

  toJSON() {
    return {
      values: this.toArray().map((item) => item.toJSON()),
    };
  }

  addItem(item: OrderItem): OrderItems {
    return new OrderItems(new Map(this.values).set(item.id.value, item));
  }

  removeItemById(itemId: OrderItemId): O.Option<[OrderItems, OrderItem]> {
    const item = this.values.get(itemId.value);
    if (item === undefined) {
      return O.none;
    }
    const newMap = new Map(this.values);
    newMap.delete(itemId.value);
    return O.some([new OrderItems(newMap), item]);
  }

  containsById(itemId: OrderItemId): boolean {
    return this.values.has(itemId.value);
  }

  findById(itemId: OrderItemId): OrderItem | undefined {
    return this.values.get(itemId.value);
  }

  toArray(): OrderItem[] {
    return Array.from(this.values.values());
  }

  toMap(): Map<OrderItemId, OrderItem> {
    return new Map(Array.from(this.values, ([key, value]) => [OrderItemId.of(key), value]));
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
    return `OrderItems(${JSON.stringify(this.toArray().map((item) => item.toString()))})`;
  }

  equals(other: OrderItems): boolean {
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

  static empty(): OrderItems {
    return new OrderItems(new Map());
  }

  static fromArray(items: OrderItem[]): OrderItems {
    const map = new Map(items.map((item) => [item.id.value, item]));
    return new OrderItems(map);
  }

  static fromMap(values: Map<OrderItemId, OrderItem>): OrderItems {
    return new OrderItems(new Map(Array.from(values, ([itemId, item]) => [itemId.value, item])));
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToOrderItems(json: any): OrderItems {
  const items = json.values.map(convertJSONToOrderItem);
  return OrderItems.fromArray(items);
}

export { OrderItems, OrderItemsTypeSymbol, convertJSONToOrderItems };
