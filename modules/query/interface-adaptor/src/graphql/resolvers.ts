import type { Prisma, PrismaClient } from "@prisma/client";
import { type ILogObj, Logger } from "tslog";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { CartItemQueryOutput, CartQueryOutput } from "./outputs";

interface QueryContext {
  prisma: PrismaClient;
}

const CART_SELECT = {
  id: true,
  name: true,
  deleted: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CartsSelect;

const CART_ITEM_SELECT = {
  id: true,
  cartId: true,
  name: true,
  quantity: true,
  price: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CartItemsSelect;

type CartRow = Prisma.CartsGetPayload<{ select: typeof CART_SELECT }>;
type CartItemRow = Prisma.CartItemsGetPayload<{ select: typeof CART_ITEM_SELECT }>;

@Resolver()
class CartQueryResolver {
  private readonly logger: Logger<ILogObj> = new Logger();

  @Query(() => CartQueryOutput)
  async getCart(@Ctx() { prisma }: QueryContext, @Arg("cartId") cartId: string): Promise<CartQueryOutput> {
    const cart = await prisma.carts.findUnique({
      where: { id: cartId },
      select: CART_SELECT,
    });
    this.logger.debug("getCart:", cart);
    if (!cart) {
      throw new Error("Cart not found");
    }
    return this.toCartOutput(cart);
  }

  @Query(() => [CartQueryOutput])
  async getCarts(@Ctx() { prisma }: QueryContext): Promise<CartQueryOutput[]> {
    const carts = await prisma.carts.findMany({
      where: { deleted: false },
      select: CART_SELECT,
    });
    this.logger.debug("getCarts:", carts);
    return carts.map((cart) => this.toCartOutput(cart));
  }

  @Query(() => CartItemQueryOutput)
  async getCartItem(
    @Ctx() { prisma }: QueryContext,
    @Arg("cartItemId") cartItemId: string,
  ): Promise<CartItemQueryOutput> {
    const item = await prisma.cartItems.findUnique({
      where: { id: cartItemId },
      select: CART_ITEM_SELECT,
    });
    if (!item) {
      throw new Error("Cart item not found");
    }
    this.logger.debug("cartItem:", item);
    return this.toCartItemOutput(item);
  }

  @Query(() => [CartItemQueryOutput])
  async getCartItems(
    @Ctx() { prisma }: QueryContext,
    @Arg("cartId") cartId: string,
  ): Promise<CartItemQueryOutput[]> {
    const items = await prisma.cartItems.findMany({
      where: {
        cartId,
        carts: { deleted: false },
      },
      select: CART_ITEM_SELECT,
    });
    this.logger.debug("cartItems:", items);
    return items.map((item) => this.toCartItemOutput(item));
  }

  private toCartOutput(cart: CartRow): CartQueryOutput {
    return {
      id: cart.id,
      name: cart.name,
      deleted: cart.deleted,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  private toCartItemOutput(item: CartItemRow): CartItemQueryOutput {
    return {
      id: item.id,
      cartId: item.cartId,
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}

export { type QueryContext, CartQueryResolver };
