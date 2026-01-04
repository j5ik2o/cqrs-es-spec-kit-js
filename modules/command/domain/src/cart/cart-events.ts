import * as Infrastructure from "cqrs-es-spec-kit-js-infrastructure";
import type { Event } from "event-store-adapter-js";
import { type UserAccountId, convertJSONToUserAccountId } from "../user-account";
import { type CartId, convertJSONToCartId } from "./cart-id";
import { type CartItem, convertJSONToCartItem } from "./cart-item";
import { type CartName, convertJSONToCartName } from "./cart-name";

type CartEventTypeSymbol =
  | typeof CartCreatedTypeSymbol
  | typeof CartItemAddedTypeSymbol
  | typeof CartItemRemovedTypeSymbol
  | typeof CartDeletedTypeSymbol;

interface CartEvent extends Event<CartId> {
  symbol: CartEventTypeSymbol;
  executorId: UserAccountId;
  toString: () => string;
}

const CartCreatedTypeSymbol = Symbol("CartCreated");

class CartCreated implements CartEvent {
  readonly symbol: typeof CartCreatedTypeSymbol = CartCreatedTypeSymbol;
  readonly typeName = "CartCreated";

  private constructor(
    public readonly id: string,
    public readonly aggregateId: CartId,
    public readonly name: CartName,
    public readonly executorId: UserAccountId,
    public readonly sequenceNumber: number,
    public readonly occurredAt: Date,
  ) {}

  isCreated = true;

  toString(): string {
    return `CartCreated(${this.id}, ${this.aggregateId.toString()}, ${this.name.toString()}, ${this.executorId.toString()}, ${this.sequenceNumber}, ${this.occurredAt.toISOString()})`;
  }

  static of(aggregateId: CartId, name: CartName, executorId: UserAccountId, sequenceNumber: number): CartCreated {
    return new CartCreated(Infrastructure.generateULID(), aggregateId, name, executorId, sequenceNumber, new Date());
  }
}

const CartItemAddedTypeSymbol = Symbol("CartItemAdded");

class CartItemAdded implements CartEvent {
  readonly symbol: typeof CartItemAddedTypeSymbol = CartItemAddedTypeSymbol;
  readonly typeName = "CartItemAdded";

  private constructor(
    public readonly id: string,
    public readonly aggregateId: CartId,
    public readonly item: CartItem,
    public readonly executorId: UserAccountId,
    public readonly sequenceNumber: number,
    public readonly occurredAt: Date,
  ) {}

  isCreated = false;

  toString(): string {
    return `CartItemAdded(${this.id}, ${this.aggregateId.toString()}, ${this.item.toString()}, ${this.executorId.toString()}, ${this.sequenceNumber}, ${this.occurredAt.toISOString()})`;
  }

  static of(aggregateId: CartId, item: CartItem, executorId: UserAccountId, sequenceNumber: number): CartItemAdded {
    return new CartItemAdded(Infrastructure.generateULID(), aggregateId, item, executorId, sequenceNumber, new Date());
  }
}

const CartItemRemovedTypeSymbol = Symbol("CartItemRemoved");

class CartItemRemoved implements CartEvent {
  readonly symbol: typeof CartItemRemovedTypeSymbol = CartItemRemovedTypeSymbol;
  readonly typeName = "CartItemRemoved";

  private constructor(
    public readonly id: string,
    public readonly aggregateId: CartId,
    public readonly item: CartItem,
    public readonly executorId: UserAccountId,
    public readonly sequenceNumber: number,
    public readonly occurredAt: Date,
  ) {}

  isCreated = false;

  toString(): string {
    return `CartItemRemoved(${this.id}, ${this.aggregateId.toString()}, ${this.item.toString()}, ${this.executorId.toString()}, ${this.sequenceNumber}, ${this.occurredAt.toISOString()})`;
  }

  static of(
    aggregateId: CartId,
    item: CartItem,
    executorId: UserAccountId,
    sequenceNumber: number,
  ): CartItemRemoved {
    return new CartItemRemoved(
      Infrastructure.generateULID(),
      aggregateId,
      item,
      executorId,
      sequenceNumber,
      new Date(),
    );
  }
}

const CartDeletedTypeSymbol = Symbol("CartDeleted");

class CartDeleted implements CartEvent {
  readonly symbol: typeof CartDeletedTypeSymbol = CartDeletedTypeSymbol;
  readonly typeName = "CartDeleted";

  private constructor(
    public readonly id: string,
    public readonly aggregateId: CartId,
    public readonly executorId: UserAccountId,
    public readonly sequenceNumber: number,
    public readonly occurredAt: Date,
  ) {}

  isCreated = false;

  toString(): string {
    return `CartDeleted(${this.id}, ${this.aggregateId.toString()}, ${this.executorId.toString()}, ${this.sequenceNumber}, ${this.occurredAt.toISOString()})`;
  }

  static of(aggregateId: CartId, executorId: UserAccountId, sequenceNumber: number): CartDeleted {
    return new CartDeleted(Infrastructure.generateULID(), aggregateId, executorId, sequenceNumber, new Date());
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToCartEvent(json: any): CartEvent {
  const aggregateId = convertJSONToCartId(json.data.aggregateId);
  const executorId = convertJSONToUserAccountId(json.data.executorId);
  switch (json.type) {
    case "CartCreated": {
      const name = convertJSONToCartName(json.data.name);
      return CartCreated.of(aggregateId, name, executorId, json.data.sequenceNumber);
    }
    case "CartItemAdded": {
      const item = convertJSONToCartItem(json.data.item);
      return CartItemAdded.of(aggregateId, item, executorId, json.data.sequenceNumber);
    }
    case "CartItemRemoved": {
      const item = convertJSONToCartItem(json.data.item);
      return CartItemRemoved.of(aggregateId, item, executorId, json.data.sequenceNumber);
    }
    case "CartDeleted": {
      return CartDeleted.of(aggregateId, executorId, json.data.sequenceNumber);
    }
    default:
      throw new Error(`Unknown type: ${json.type}`);
  }
}

export type { CartEvent, CartEventTypeSymbol };

export {
  CartCreated,
  CartCreatedTypeSymbol,
  CartItemAdded,
  CartItemAddedTypeSymbol,
  CartItemRemoved,
  CartItemRemovedTypeSymbol,
  CartDeleted,
  CartDeletedTypeSymbol,
  convertJSONToCartEvent,
};
