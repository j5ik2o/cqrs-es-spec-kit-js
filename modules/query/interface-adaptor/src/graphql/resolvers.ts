import type { PrismaClient } from "@prisma/client";
import { type ILogObj, Logger } from "tslog";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { CartItemQueryOutput, CartQueryOutput } from "./outputs";

type CartItemRow = Omit<CartItemQueryOutput, "quantity" | "price"> & {
  quantity: number | string | bigint;
  price: number | string | bigint;
};

interface QueryContext {
  prisma: PrismaClient;
}

@Resolver()
class CartQueryResolver {
  private readonly logger: Logger<ILogObj> = new Logger();

  @Query(() => CartQueryOutput)
  async getCart(@Ctx() { prisma }: QueryContext, @Arg("cartId") cartId: string): Promise<CartQueryOutput> {
    const carts: CartQueryOutput[] = await prisma.$queryRaw<CartQueryOutput[]>`
        SELECT
            o.id as id,
            o.name as name,
            o.deleted as deleted,
            o.created_at as createdAt,
            o.updated_at as updatedAt
        FROM
            carts AS o
        WHERE
            o.id = ${cartId}`;
    this.logger.debug("getCart:", carts);
    if (!carts.length) {
      throw new Error("Cart not found");
    }
    this.logger.debug("cart:", carts[0]);
    return carts[0];
  }

  @Query(() => [CartQueryOutput])
  async getCarts(@Ctx() { prisma }: QueryContext): Promise<CartQueryOutput[]> {
    const carts: CartQueryOutput[] = await prisma.$queryRaw<CartQueryOutput[]>`
        SELECT
            o.id as id,
            o.name as name,
            o.deleted as deleted,
            o.created_at as createdAt,
            o.updated_at as updatedAt
        FROM
            carts AS o
        WHERE
            o.deleted = false`;
    this.logger.debug("getCarts:", carts);
    return carts;
  }

  @Query(() => CartItemQueryOutput)
  async getCartItem(
    @Ctx() { prisma }: QueryContext,
    @Arg("cartItemId") cartItemId: string,
  ): Promise<CartItemQueryOutput> {
    const items: CartItemRow[] = await prisma.$queryRaw<CartItemRow[]>`
        SELECT
            oi.id as id,
            oi.cart_id as cartId,
            oi.name as name,
            oi.quantity as quantity,
            oi.price as price,
            oi.created_at as createdAt,
            oi.updated_at as updatedAt
        FROM
            cart_items AS oi
        WHERE
            oi.id = ${cartItemId}`;
    if (!items.length) {
      throw new Error("Cart item not found");
    }
    this.logger.debug("cartItem:", items[0]);
    return this.normalizeCartItem(items[0]);
  }

  @Query(() => [CartItemQueryOutput])
  async getCartItems(
    @Ctx() { prisma }: QueryContext,
    @Arg("cartId") cartId: string,
  ): Promise<CartItemQueryOutput[]> {
    const items: CartItemRow[] = await prisma.$queryRaw<CartItemRow[]>`
        SELECT
            oi.id as id,
            oi.cart_id as cartId,
            oi.name as name,
            oi.quantity as quantity,
            oi.price as price,
            oi.created_at as createdAt,
            oi.updated_at as updatedAt
        FROM
            carts AS o JOIN cart_items AS oi ON o.id = oi.cart_id
        WHERE
            o.deleted = false AND oi.cart_id = ${cartId}`;
    this.logger.debug("cartItems:", items);
    return items.map((item) => this.normalizeCartItem(item));
  }

  private normalizeCartItem(item: CartItemRow): CartItemQueryOutput {
    return {
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
    };
  }
}

export { type QueryContext, CartQueryResolver };
