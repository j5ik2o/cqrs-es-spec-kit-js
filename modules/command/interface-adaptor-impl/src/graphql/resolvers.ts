import {
  OrderError,
  OrderId,
  OrderItem,
  OrderItemId,
  OrderName,
  UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import {
  type OrderCommandProcessor,
  ProcessNotFoundError,
} from "cqrs-es-spec-kit-js-command-processor";
import type { ProcessError } from "cqrs-es-spec-kit-js-command-processor";
import { OptimisticLockError } from "event-store-adapter-js";
import type { Task } from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import type { TaskEither } from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { GraphQLError } from "graphql/error";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import type {
  AddItemInput,
  CreateOrderInput,
  DeleteOrderInput,
  RemoveItemInput,
} from "./inputs";
import { HealthCheckOutput, OrderItemOutput, OrderOutput } from "./outputs";

interface CommandContext {
  orderCommandProcessor: OrderCommandProcessor;
}

@Resolver()
class OrderCommandResolver {
  @Query(() => HealthCheckOutput)
  async healthCheck(): Promise<HealthCheckOutput> {
    return { value: "OK" };
  }

  @Mutation(() => OrderOutput)
  async createOrder(
    @Ctx() { orderCommandProcessor }: CommandContext,
    @Arg("input") input: CreateOrderInput,
  ): Promise<OrderOutput> {
    return pipe(
      this.validateOrderName(input.name),
      TE.chainW((validatedName) =>
        pipe(
          this.validateUserAccountId(input.executorId),
          TE.map((validatedExecutorId) => ({
            validatedName,
            validatedExecutorId,
          })),
        ),
      ),
      TE.chainW(({ validatedName, validatedExecutorId }) =>
        orderCommandProcessor.createOrder(validatedName, validatedExecutorId),
      ),
      TE.map((orderEvent) => ({
        orderId: orderEvent.aggregateId.asString(),
      })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  @Mutation(() => OrderItemOutput)
  async addItem(
    @Ctx() { orderCommandProcessor }: CommandContext,
    @Arg("input") input: AddItemInput,
  ): Promise<OrderItemOutput> {
    return pipe(
      this.validateOrderId(input.orderId),
      TE.chainW((validatedOrderId) =>
        pipe(
          this.validateUserAccountId(input.executorId),
          TE.map((validatedExecutorId) => ({
            validatedOrderId,
            validatedExecutorId,
          })),
        ),
      ),
      TE.chainW(({ validatedOrderId, validatedExecutorId }) =>
        pipe(
          this.validateOrderItem(
            OrderItemId.generate(),
            input.name,
            input.quantity,
            input.price,
          ),
          TE.map((validatedItem) => ({
            validatedOrderId,
            validatedExecutorId,
            validatedItem,
          })),
        ),
      ),
      TE.chainW(({ validatedOrderId, validatedExecutorId, validatedItem }) =>
        pipe(
          orderCommandProcessor.addItemToOrder(
            validatedOrderId,
            validatedItem,
            validatedExecutorId,
          ),
          TE.map((orderEvent) => ({
            orderId: orderEvent.aggregateId.asString(),
            itemId: validatedItem.id.asString(),
          })),
        ),
      ),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  @Mutation(() => OrderOutput)
  async removeItem(
    @Ctx() { orderCommandProcessor }: CommandContext,
    @Arg("input") input: RemoveItemInput,
  ): Promise<OrderOutput> {
    return pipe(
      this.validateOrderId(input.orderId),
      TE.chainW((validatedOrderId) =>
        pipe(
          this.validateOrderItemId(input.itemId),
          TE.map((validatedItemId) => ({
            validatedOrderId,
            validatedItemId,
          })),
        ),
      ),
      TE.chainW(({ validatedOrderId, validatedItemId }) =>
        pipe(
          this.validateUserAccountId(input.executorId),
          TE.map((validatedExecutorId) => ({
            validatedOrderId,
            validatedItemId,
            validatedExecutorId,
          })),
        ),
      ),
      TE.chainW(({ validatedOrderId, validatedItemId, validatedExecutorId }) =>
        orderCommandProcessor.removeItemFromOrder(
          validatedOrderId,
          validatedItemId,
          validatedExecutorId,
        ),
      ),
      TE.map((orderEvent) => ({
        orderId: orderEvent.aggregateId.asString(),
      })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  @Mutation(() => OrderOutput)
  async deleteOrder(
    @Ctx() { orderCommandProcessor }: CommandContext,
    @Arg("input") input: DeleteOrderInput,
  ): Promise<OrderOutput> {
    return pipe(
      this.validateOrderId(input.orderId),
      TE.chainW((validatedOrderId) =>
        pipe(
          this.validateUserAccountId(input.executorId),
          TE.map((validatedExecutorId) => ({
            validatedOrderId,
            validatedExecutorId,
          })),
        ),
      ),
      TE.chainW(({ validatedOrderId, validatedExecutorId }) =>
        orderCommandProcessor.deleteOrder(validatedOrderId, validatedExecutorId),
      ),
      TE.map((orderEvent) => ({
        orderId: orderEvent.aggregateId.asString(),
      })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  private convertToError(error: string | ProcessError): Error {
    if (typeof error === "string") {
      return new ValidationGraphQLError(error);
    }
    if (
      error.cause instanceof RepositoryError &&
      error.cause.cause instanceof OptimisticLockError
    ) {
      return new OptimisticLockingGraphQLError(
        "A conflict occurred while attempting to save your changes. Please try again.",
        error,
      );
    }
    if (error.cause instanceof OrderError) {
      return new DomainLogicGraphQLError(
        "The request could not be processed due to a domain logic error. Please verify your data and try again.",
        error,
      );
    }
    if (error instanceof ProcessNotFoundError) {
      return new NotFoundGraphQLError(
        "The requested resource could not be found.",
        error,
      );
    }
    return new InternalServerGraphQLError(
      "An unexpected error occurred. Please try again later.",
      error,
    );
  }

  private toTask<A, B>(): (_: TaskEither<A, B>) => Task<B> {
    return TE.fold<A, B, B>(
      (e) => () => Promise.reject(e),
      (r) => () => Promise.resolve(r),
    );
  }

  private validateOrderId(value: string): TaskEither<string, OrderId> {
    return TE.fromEither(OrderId.validate(value));
  }

  private validateOrderItemId(value: string): TaskEither<string, OrderItemId> {
    return TE.fromEither(OrderItemId.validate(value));
  }

  private validateUserAccountId(
    value: string,
  ): TaskEither<string, UserAccountId> {
    return TE.fromEither(UserAccountId.validate(value));
  }

  private validateOrderName(value: string): TaskEither<string, OrderName> {
    return TE.fromEither(OrderName.validate(value));
  }

  private validateOrderItem(
    id: OrderItemId,
    name: string,
    quantity: number,
    price: number,
  ): TE.TaskEither<string, OrderItem> {
    return TE.fromEither(OrderItem.validate(id, name, quantity, price));
  }
}

class ValidationGraphQLError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: "400",
      },
    });
  }
}

class NotFoundGraphQLError extends GraphQLError {
  constructor(message: string, cause?: ProcessError) {
    super(message, {
      extensions: {
        code: "404",
        cause: { message: cause?.message, stack: cause?.stack },
      },
    });
  }
}

class OptimisticLockingGraphQLError extends GraphQLError {
  constructor(message: string, cause?: ProcessError) {
    super(message, {
      extensions: {
        code: "409",
        cause: { message: cause?.message, stack: cause?.stack },
      },
    });
  }
}

class DomainLogicGraphQLError extends GraphQLError {
  constructor(message: string, cause?: ProcessError) {
    super(message, {
      extensions: {
        code: "422",
        cause: { message: cause?.message, stack: cause?.stack },
      },
    });
  }
}

class InternalServerGraphQLError extends GraphQLError {
  constructor(message: string, cause?: ProcessError) {
    super(message, {
      extensions: {
        code: "500",
        cause: { message: cause?.message, stack: cause?.stack },
      },
    });
  }
}

export {
  type CommandContext,
  OrderCommandResolver,
  ValidationGraphQLError,
  OptimisticLockingGraphQLError,
  InternalServerGraphQLError,
};
