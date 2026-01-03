import type { Aggregate } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import type { UserAccountId } from "../user-account";
import { OrderAddItemError, OrderDeleteError, OrderRemoveItemError } from "./order-errors";
import {
  OrderCreated,
  OrderDeleted,
  OrderDeletedTypeSymbol,
  type OrderEvent,
  OrderItemAdded,
  OrderItemAddedTypeSymbol,
  OrderItemRemoved,
  OrderItemRemovedTypeSymbol,
} from "./order-events";
import { type OrderId, convertJSONToOrderId } from "./order-id";
import type { OrderItem } from "./order-item";
import type { OrderItemId } from "./order-item-id";
import { OrderItems, convertJSONToOrderItems } from "./order-items";
import { type OrderName, convertJSONToOrderName } from "./order-name";

const OrderTypeSymbol = Symbol("Order");

interface OrderParams {
  id: OrderId;
  deleted: boolean;
  name: OrderName;
  items: OrderItems;
  sequenceNumber: number;
  version: number;
}

class Order implements Aggregate<Order, OrderId> {
  readonly symbol: typeof OrderTypeSymbol = OrderTypeSymbol;
  readonly typeName = "Order";

  public readonly id: OrderId;
  public readonly deleted: boolean;
  public readonly name: OrderName;
  public readonly items: OrderItems;
  public readonly sequenceNumber: number;
  public readonly version: number;

  private constructor(params: OrderParams) {
    this.id = params.id;
    this.deleted = params.deleted;
    this.name = params.name;
    this.items = params.items;
    this.sequenceNumber = params.sequenceNumber;
    this.version = params.version;
  }

  toJSON() {
    return {
      id: this.id.toJSON(),
      deleted: this.deleted,
      name: this.name.toJSON(),
      items: this.items.toJSON(),
      sequenceNumber: this.sequenceNumber,
      version: this.version,
    };
  }

  addItem(item: OrderItem, executorId: UserAccountId): E.Either<OrderAddItemError, [Order, OrderItemAdded]> {
    if (this.deleted) {
      return E.left(OrderAddItemError.of("The order is deleted"));
    }

    const newItems = this.items.addItem(item);
    const newSequenceNumber = this.sequenceNumber + 1;
    const newOrder: Order = new Order({
      ...this,
      items: newItems,
      sequenceNumber: newSequenceNumber,
    });

    const event = OrderItemAdded.of(this.id, item, executorId, newSequenceNumber);

    return E.right([newOrder, event]);
  }

  removeItem(
    itemId: OrderItemId,
    executorId: UserAccountId,
  ): E.Either<OrderRemoveItemError, [Order, OrderItemRemoved]> {
    if (this.deleted) {
      return E.left(OrderRemoveItemError.of("The order is deleted"));
    }

    if (!this.items.containsById(itemId)) {
      return E.left(OrderRemoveItemError.of("The item does not exist"));
    }

    const removedItemOpt = this.items.removeItemById(itemId);
    if (O.isNone(removedItemOpt)) {
      return E.left(OrderRemoveItemError.of("The item does not exist"));
    }

    const [newItems, removedItem] = removedItemOpt.value;
    const newSequenceNumber = this.sequenceNumber + 1;
    const newOrder: Order = new Order({
      ...this,
      items: newItems,
      sequenceNumber: newSequenceNumber,
    });

    const event = OrderItemRemoved.of(this.id, removedItem, executorId, newSequenceNumber);

    return E.right([newOrder, event]);
  }

  delete(executorId: UserAccountId): E.Either<OrderDeleteError, [Order, OrderDeleted]> {
    if (this.deleted) {
      return E.left(OrderDeleteError.of("The order is already deleted"));
    }

    const newSequenceNumber = this.sequenceNumber + 1;
    const newOrder: Order = new Order({
      ...this,
      deleted: true,
      sequenceNumber: newSequenceNumber,
    });

    const event = OrderDeleted.of(this.id, executorId, newSequenceNumber);

    return E.right([newOrder, event]);
  }

  withVersion(version: number): Order {
    return new Order({ ...this, version });
  }

  updateVersion(versionF: (value: number) => number): Order {
    return new Order({ ...this, version: versionF(this.version) });
  }

  withSequenceNumber(sequenceNumber: number): Order {
    return new Order({ ...this, sequenceNumber });
  }

  applyEvent(event: OrderEvent): Order {
    switch (event.symbol) {
      case OrderItemAddedTypeSymbol: {
        const typedEvent = event as OrderItemAdded;
        const result = this.addItem(typedEvent.item, event.executorId);
        if (E.isLeft(result)) {
          throw new Error(result.left.message);
        }
        return result.right[0];
      }
      case OrderItemRemovedTypeSymbol: {
        const typedEvent = event as OrderItemRemoved;
        const result = this.removeItem(typedEvent.item.id, event.executorId);
        if (E.isLeft(result)) {
          throw new Error(result.left.message);
        }
        return result.right[0];
      }
      case OrderDeletedTypeSymbol: {
        const typedEvent = event as OrderDeleted;
        const result = this.delete(typedEvent.executorId);
        if (E.isLeft(result)) {
          throw new Error(result.left.message);
        }
        return result.right[0];
      }
      default: {
        throw new Error("Unknown event");
      }
    }
  }

  static replay(events: OrderEvent[], snapshot: Order): Order {
    return events.reduce((order, event) => order.applyEvent(event), snapshot);
  }

  static create(id: OrderId, name: OrderName, executorId: UserAccountId): [Order, OrderCreated] {
    const sequenceNumber = 1;
    const order = new Order({
      id,
      deleted: false,
      name,
      items: OrderItems.empty(),
      sequenceNumber,
      version: 1,
    });

    const event = OrderCreated.of(id, name, executorId, sequenceNumber);

    return [order, event];
  }

  static of(params: OrderParams): Order {
    return new Order(params);
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToOrder(json: any): Order {
  const data = json.data ?? json;
  const id = convertJSONToOrderId(data.id);
  const name = convertJSONToOrderName(data.name);
  const items = convertJSONToOrderItems(data.items);
  return Order.of({
    id,
    deleted: data.deleted,
    name,
    items,
    sequenceNumber: data.sequenceNumber,
    version: data.version,
  });
}

export { Order, OrderTypeSymbol, convertJSONToOrder };
