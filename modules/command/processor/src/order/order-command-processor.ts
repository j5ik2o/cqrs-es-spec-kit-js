import {
  Order,
  OrderAddItemError,
  OrderDeleteError,
  type OrderEvent,
  OrderId,
  type OrderItem,
  type OrderItemId,
  type OrderName,
  OrderRemoveItemError,
  type UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import {
  type OrderRepository,
  RepositoryError,
} from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

class OrderCommandProcessor {
  private constructor(private readonly orderRepository: OrderRepository) {}

  createOrder(
    name: OrderName,
    executorId: UserAccountId,
  ): TE.TaskEither<ProcessError, OrderEvent> {
    return pipe(
      TE.right(OrderId.generate()),
      TE.chain((id) => TE.right(Order.create(id, name, executorId))),
      TE.chain(([order, orderCreated]) =>
        pipe(
          this.orderRepository.store(orderCreated, order),
          TE.map(() => orderCreated),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  addItemToOrder(
    id: OrderId,
    item: OrderItem,
    executorId: UserAccountId,
  ): TE.TaskEither<ProcessError, OrderEvent> {
    return pipe(
      this.orderRepository.findById(id),
      TE.chainW(this.getOrError),
      TE.chainW((order) =>
        pipe(
          this.addItemAsync(order, item, executorId),
          TE.chainW(([order, orderItemAdded]) =>
            pipe(
              this.orderRepository.store(orderItemAdded, order),
              TE.map(() => orderItemAdded),
            ),
          ),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  removeItemFromOrder(
    id: OrderId,
    itemId: OrderItemId,
    executorId: UserAccountId,
  ): TE.TaskEither<ProcessError, OrderEvent> {
    return pipe(
      this.orderRepository.findById(id),
      TE.chainW(this.getOrError),
      TE.chainW((order) =>
        pipe(
          this.removeItemAsync(order, itemId, executorId),
          TE.chainW(([order, orderItemRemoved]) =>
            pipe(
              this.orderRepository.store(orderItemRemoved, order),
              TE.map(() => orderItemRemoved),
            ),
          ),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  deleteOrder(
    id: OrderId,
    executorId: UserAccountId,
  ): TE.TaskEither<ProcessError, OrderEvent> {
    return pipe(
      this.orderRepository.findById(id),
      TE.chainW(this.getOrError),
      TE.chainW((order) =>
        pipe(
          this.deleteOrderAsync(order, executorId),
          TE.chainW(([order, orderDeleted]) =>
            pipe(
              this.orderRepository.store(orderDeleted, order),
              TE.map(() => orderDeleted),
            ),
          ),
        ),
      ),
      TE.mapLeft(this.convertToProcessError),
    );
  }

  static of(orderRepository: OrderRepository): OrderCommandProcessor {
    return new OrderCommandProcessor(orderRepository);
  }

  private convertToProcessError(e: unknown): ProcessError {
    if (e instanceof ProcessError) {
      return e;
    }
    if (e instanceof RepositoryError) {
      return new ProcessInternalError("Repository operation failed", e);
    }
    if (e instanceof OrderDeleteError) {
      return new ProcessInternalError("Failed to delete order", e);
    }
    if (e instanceof OrderAddItemError) {
      return new ProcessInternalError("Failed to add item to order", e);
    }
    if (e instanceof OrderRemoveItemError) {
      return new ProcessInternalError("Failed to remove item from order", e);
    }
    throw e;
  }

  private getOrError(
    orderOpt: Order | undefined,
  ): TE.TaskEither<ProcessError, Order> {
    return orderOpt === undefined
      ? TE.left(new ProcessNotFoundError("Order not found"))
      : TE.right(orderOpt);
  }

  private addItemAsync(
    order: Order,
    item: OrderItem,
    executorId: UserAccountId,
  ) {
    return TE.fromEither(order.addItem(item, executorId));
  }

  private removeItemAsync(
    order: Order,
    itemId: OrderItemId,
    executorId: UserAccountId,
  ) {
    return TE.fromEither(order.removeItem(itemId, executorId));
  }

  private deleteOrderAsync(order: Order, executorId: UserAccountId) {
    return TE.fromEither(order.delete(executorId));
  }
}

abstract class ProcessError extends Error {}

class ProcessInternalError extends ProcessError {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "ProcessInternalError";
    this.cause = cause;
  }
}

class ProcessNotFoundError extends ProcessError {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "ProcessNotFoundError";
    this.cause = cause;
  }
}

export {
  OrderCommandProcessor,
  ProcessError,
  ProcessInternalError,
  ProcessNotFoundError,
};
