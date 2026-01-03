import * as Infrastructure from "cqrs-es-spec-kit-js-infrastructure";
import type { Event } from "event-store-adapter-js";
import { type UserAccountId, convertJSONToUserAccountId } from "../user-account";
import { type OrderId, convertJSONToOrderId } from "./order-id";
import { type OrderItem, convertJSONToOrderItem } from "./order-item";
import { type OrderName, convertJSONToOrderName } from "./order-name";

type OrderEventTypeSymbol =
  | typeof OrderCreatedTypeSymbol
  | typeof OrderItemAddedTypeSymbol
  | typeof OrderItemRemovedTypeSymbol
  | typeof OrderDeletedTypeSymbol;

interface OrderEvent extends Event<OrderId> {
  symbol: OrderEventTypeSymbol;
  executorId: UserAccountId;
  toString: () => string;
}

const OrderCreatedTypeSymbol = Symbol("OrderCreated");

class OrderCreated implements OrderEvent {
  readonly symbol: typeof OrderCreatedTypeSymbol = OrderCreatedTypeSymbol;
  readonly typeName = "OrderCreated";

  private constructor(
    public readonly id: string,
    public readonly aggregateId: OrderId,
    public readonly name: OrderName,
    public readonly executorId: UserAccountId,
    public readonly sequenceNumber: number,
    public readonly occurredAt: Date,
  ) {}

  isCreated = true;

  toString(): string {
    return `OrderCreated(${this.id}, ${this.aggregateId.toString()}, ${this.name.toString()}, ${this.executorId.toString()}, ${this.sequenceNumber}, ${this.occurredAt.toISOString()})`;
  }

  static of(aggregateId: OrderId, name: OrderName, executorId: UserAccountId, sequenceNumber: number): OrderCreated {
    return new OrderCreated(Infrastructure.generateULID(), aggregateId, name, executorId, sequenceNumber, new Date());
  }
}

const OrderItemAddedTypeSymbol = Symbol("OrderItemAdded");

class OrderItemAdded implements OrderEvent {
  readonly symbol: typeof OrderItemAddedTypeSymbol = OrderItemAddedTypeSymbol;
  readonly typeName = "OrderItemAdded";

  private constructor(
    public readonly id: string,
    public readonly aggregateId: OrderId,
    public readonly item: OrderItem,
    public readonly executorId: UserAccountId,
    public readonly sequenceNumber: number,
    public readonly occurredAt: Date,
  ) {}

  isCreated = false;

  toString(): string {
    return `OrderItemAdded(${this.id}, ${this.aggregateId.toString()}, ${this.item.toString()}, ${this.executorId.toString()}, ${this.sequenceNumber}, ${this.occurredAt.toISOString()})`;
  }

  static of(aggregateId: OrderId, item: OrderItem, executorId: UserAccountId, sequenceNumber: number): OrderItemAdded {
    return new OrderItemAdded(Infrastructure.generateULID(), aggregateId, item, executorId, sequenceNumber, new Date());
  }
}

const OrderItemRemovedTypeSymbol = Symbol("OrderItemRemoved");

class OrderItemRemoved implements OrderEvent {
  readonly symbol: typeof OrderItemRemovedTypeSymbol = OrderItemRemovedTypeSymbol;
  readonly typeName = "OrderItemRemoved";

  private constructor(
    public readonly id: string,
    public readonly aggregateId: OrderId,
    public readonly item: OrderItem,
    public readonly executorId: UserAccountId,
    public readonly sequenceNumber: number,
    public readonly occurredAt: Date,
  ) {}

  isCreated = false;

  toString(): string {
    return `OrderItemRemoved(${this.id}, ${this.aggregateId.toString()}, ${this.item.toString()}, ${this.executorId.toString()}, ${this.sequenceNumber}, ${this.occurredAt.toISOString()})`;
  }

  static of(
    aggregateId: OrderId,
    item: OrderItem,
    executorId: UserAccountId,
    sequenceNumber: number,
  ): OrderItemRemoved {
    return new OrderItemRemoved(
      Infrastructure.generateULID(),
      aggregateId,
      item,
      executorId,
      sequenceNumber,
      new Date(),
    );
  }
}

const OrderDeletedTypeSymbol = Symbol("OrderDeleted");

class OrderDeleted implements OrderEvent {
  readonly symbol: typeof OrderDeletedTypeSymbol = OrderDeletedTypeSymbol;
  readonly typeName = "OrderDeleted";

  private constructor(
    public readonly id: string,
    public readonly aggregateId: OrderId,
    public readonly executorId: UserAccountId,
    public readonly sequenceNumber: number,
    public readonly occurredAt: Date,
  ) {}

  isCreated = false;

  toString(): string {
    return `OrderDeleted(${this.id}, ${this.aggregateId.toString()}, ${this.executorId.toString()}, ${this.sequenceNumber}, ${this.occurredAt.toISOString()})`;
  }

  static of(aggregateId: OrderId, executorId: UserAccountId, sequenceNumber: number): OrderDeleted {
    return new OrderDeleted(Infrastructure.generateULID(), aggregateId, executorId, sequenceNumber, new Date());
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToOrderEvent(json: any): OrderEvent {
  const aggregateId = convertJSONToOrderId(json.data.aggregateId);
  const executorId = convertJSONToUserAccountId(json.data.executorId);
  switch (json.type) {
    case "OrderCreated": {
      const name = convertJSONToOrderName(json.data.name);
      return OrderCreated.of(aggregateId, name, executorId, json.data.sequenceNumber);
    }
    case "OrderItemAdded": {
      const item = convertJSONToOrderItem(json.data.item);
      return OrderItemAdded.of(aggregateId, item, executorId, json.data.sequenceNumber);
    }
    case "OrderItemRemoved": {
      const item = convertJSONToOrderItem(json.data.item);
      return OrderItemRemoved.of(aggregateId, item, executorId, json.data.sequenceNumber);
    }
    case "OrderDeleted": {
      return OrderDeleted.of(aggregateId, executorId, json.data.sequenceNumber);
    }
    default:
      throw new Error(`Unknown type: ${json.type}`);
  }
}

export type { OrderEvent, OrderEventTypeSymbol };

export {
  OrderCreated,
  OrderCreatedTypeSymbol,
  OrderItemAdded,
  OrderItemAddedTypeSymbol,
  OrderItemRemoved,
  OrderItemRemovedTypeSymbol,
  OrderDeleted,
  OrderDeletedTypeSymbol,
  convertJSONToOrderEvent,
};
