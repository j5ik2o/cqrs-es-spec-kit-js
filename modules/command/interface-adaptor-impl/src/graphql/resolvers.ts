import {
  CartError,
  CartId,
  CartItem,
  CartItemId,
  CartName,
  UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { RepositoryError } from "cqrs-es-spec-kit-js-command-interface-adaptor-if";
import { type CartCommandProcessor, ProcessNotFoundError } from "cqrs-es-spec-kit-js-command-processor";
import type { ProcessError } from "cqrs-es-spec-kit-js-command-processor";
import { OptimisticLockError } from "event-store-adapter-js";
import { sequenceS } from "fp-ts/Apply";
import type { Task } from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import type { TaskEither } from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { GraphQLError } from "graphql/error";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  AddItemToCartInput,
  CreateCartInput,
  DeleteCartInput,
  RemoveItemFromCartInput,
} from "./inputs";
import { HealthCheckOutput, CartItemOutput, CartOutput } from "./outputs";

interface CommandContext {
  cartCommandProcessor: CartCommandProcessor;
}

@Resolver()
class CartCommandResolver {
  @Query(() => HealthCheckOutput)
  async healthCheck(): Promise<HealthCheckOutput> {
    return { value: "OK" };
  }

  @Mutation(() => CartOutput)
  async createCart(
    @Ctx() { cartCommandProcessor }: CommandContext,
    @Arg("input", () => CreateCartInput) input: CreateCartInput,
  ): Promise<CartOutput> {
    return pipe(
      this.validateAll({
        name: this.validateCartName(input.name),
        executorId: this.validateUserAccountId(input.executorId),
      }),
      TE.chainW(({ name, executorId }) => cartCommandProcessor.createCart(name, executorId)),
      TE.map((cartEvent) => ({
        cartId: cartEvent.aggregateId.asString(),
      })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  @Mutation(() => CartItemOutput)
  async addItemToCart(
    @Ctx() { cartCommandProcessor }: CommandContext,
    @Arg("input", () => AddItemToCartInput) input: AddItemToCartInput,
  ): Promise<CartItemOutput> {
    return pipe(
      this.validateAll({
        cartId: this.validateCartId(input.cartId),
        executorId: this.validateUserAccountId(input.executorId),
        item: this.validateCartItem(CartItemId.generate(), input.name, input.quantity, input.price),
      }),
      TE.chainW(({ cartId, executorId, item }) =>
        pipe(
          cartCommandProcessor.addItemToCart(cartId, item, executorId),
          TE.map((cartEvent) => ({
            cartId: cartEvent.aggregateId.asString(),
            itemId: item.id.asString(),
          })),
        ),
      ),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  @Mutation(() => CartOutput)
  async removeItemFromCart(
    @Ctx() { cartCommandProcessor }: CommandContext,
    @Arg("input", () => RemoveItemFromCartInput) input: RemoveItemFromCartInput,
  ): Promise<CartOutput> {
    return pipe(
      this.validateAll({
        cartId: this.validateCartId(input.cartId),
        itemId: this.validateCartItemId(input.itemId),
        executorId: this.validateUserAccountId(input.executorId),
      }),
      TE.chainW(({ cartId, itemId, executorId }) =>
        cartCommandProcessor.removeItemFromCart(cartId, itemId, executorId),
      ),
      TE.map((cartEvent) => ({
        cartId: cartEvent.aggregateId.asString(),
      })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  @Mutation(() => CartOutput)
  async deleteCart(
    @Ctx() { cartCommandProcessor }: CommandContext,
    @Arg("input", () => DeleteCartInput) input: DeleteCartInput,
  ): Promise<CartOutput> {
    return pipe(
      this.validateAll({
        cartId: this.validateCartId(input.cartId),
        executorId: this.validateUserAccountId(input.executorId),
      }),
      TE.chainW(({ cartId, executorId }) => cartCommandProcessor.deleteCart(cartId, executorId)),
      TE.map((cartEvent) => ({
        cartId: cartEvent.aggregateId.asString(),
      })),
      TE.mapLeft(this.convertToError),
      this.toTask(),
    )();
  }

  private validateAll<T extends Record<string, unknown>>(
    validators: { [K in keyof T]: TaskEither<string, T[K]> },
  ): TaskEither<string, T> {
    return sequenceS(TE.ApplicativePar)(
      validators as Record<string, TaskEither<string, unknown>>,
    ) as TaskEither<string, T>;
  }

  private convertToError(error: string | ProcessError): Error {
    if (typeof error === "string") {
      return new ValidationGraphQLError(error);
    }
    if (error.cause instanceof RepositoryError && error.cause.cause instanceof OptimisticLockError) {
      return new OptimisticLockingGraphQLError(
        "A conflict occurred while attempting to save your changes. Please try again.",
        error,
      );
    }
    if (error.cause instanceof CartError) {
      return new DomainLogicGraphQLError(
        "The request could not be processed due to a domain logic error. Please verify your data and try again.",
        error,
      );
    }
    if (error instanceof ProcessNotFoundError) {
      return new NotFoundGraphQLError("The requested resource could not be found.", error);
    }
    return new InternalServerGraphQLError("An unexpected error occurred. Please try again later.", error);
  }

  private toTask<A, B>(): (_: TaskEither<A, B>) => Task<B> {
    return TE.fold<A, B, B>(
      (e) => () => Promise.reject(e),
      (r) => () => Promise.resolve(r),
    );
  }

  private validateCartId(value: string): TaskEither<string, CartId> {
    return TE.fromEither(CartId.validate(value));
  }

  private validateCartItemId(value: string): TaskEither<string, CartItemId> {
    return TE.fromEither(CartItemId.validate(value));
  }

  private validateUserAccountId(value: string): TaskEither<string, UserAccountId> {
    return TE.fromEither(UserAccountId.validate(value));
  }

  private validateCartName(value: string): TaskEither<string, CartName> {
    return TE.fromEither(CartName.validate(value));
  }

  private validateCartItem(
    id: CartItemId,
    name: string,
    quantity: number,
    price: number,
  ): TE.TaskEither<string, CartItem> {
    return TE.fromEither(CartItem.validate(id, name, quantity, price));
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
  CartCommandResolver,
  ValidationGraphQLError,
  OptimisticLockingGraphQLError,
  InternalServerGraphQLError,
};
