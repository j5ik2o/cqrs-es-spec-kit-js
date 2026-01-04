import type { PrismaClient } from "@prisma/client";
import type { CartId, CartItem, CartItemId, CartName } from "cqrs-es-spec-kit-js-command-domain";

class CartDao {
  private constructor(private readonly prismaClient: PrismaClient) {}

  async insertCart(aggregateId: CartId, name: CartName, createdAt: Date): Promise<void> {
    await this.prismaClient.carts.create({
      data: {
        id: aggregateId.asString(),
        deleted: false,
        name: name.asString(),
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    });
  }

  async deleteCart(aggregateId: CartId, updatedAt: Date): Promise<void> {
    await this.prismaClient.carts.update({
      where: { id: aggregateId.asString() },
      data: { deleted: true, updatedAt: updatedAt },
    });
  }

  async insertCartItem(aggregateId: CartId, item: CartItem, createdAt: Date): Promise<void> {
    await this.prismaClient.cartItems.create({
      data: {
        id: item.id.asString(),
        cartId: aggregateId.asString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    });
  }

  async deleteCartItem(itemId: CartItemId): Promise<void> {
    await this.prismaClient.cartItems.delete({
      where: { id: itemId.asString() },
    });
  }

  static of(prismaClient: PrismaClient): CartDao {
    return new CartDao(prismaClient);
  }
}

export { CartDao };
