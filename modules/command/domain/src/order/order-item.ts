import * as E from "fp-ts/lib/Either";
import { type OrderItemId, convertJSONToOrderItemId } from "./order-item-id";

const OrderItemTypeSymbol = Symbol("OrderItem");

interface OrderItemParams {
  id: OrderItemId;
  name: string;
  quantity: number;
  price: number;
}

class OrderItem {
  readonly symbol: typeof OrderItemTypeSymbol = OrderItemTypeSymbol;

  public readonly id: OrderItemId;
  public readonly name: string;
  public readonly quantity: number;
  public readonly price: number;

  private constructor(params: OrderItemParams) {
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

  withQuantity(quantity: number): OrderItem {
    return new OrderItem({ ...this, quantity });
  }

  toString(): string {
    return `OrderItem(${this.id.toString()}, ${this.name}, ${this.quantity}, ${this.price})`;
  }

  equals(other: OrderItem): boolean {
    return this.id.equals(other.id);
  }

  static of(
    id: OrderItemId,
    name: string,
    quantity: number,
    price: number,
  ): OrderItem {
    return new OrderItem({ id, name, quantity, price });
  }

  static validate(
    id: OrderItemId,
    name: string,
    quantity: number,
    price: number,
  ): E.Either<string, OrderItem> {
    try {
      return E.right(OrderItem.of(id, name, quantity, price));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToOrderItem(json: any): OrderItem {
  const id = convertJSONToOrderItemId(json.id);
  return OrderItem.of(id, json.name, json.quantity, json.price);
}

export { OrderItem, OrderItemTypeSymbol, convertJSONToOrderItem };
