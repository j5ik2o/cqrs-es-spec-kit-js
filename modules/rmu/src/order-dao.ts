import type { PrismaClient } from "@prisma/client";
import type { OrderId, OrderItem, OrderItemId, OrderName } from "cqrs-es-spec-kit-js-command-domain";

class OrderDao {
  private constructor(private readonly prismaClient: PrismaClient) {}

  async insertOrder(aggregateId: OrderId, name: OrderName, createdAt: Date): Promise<void> {
    await this.prismaClient.orders.create({
      data: {
        id: aggregateId.asString(),
        deleted: false,
        name: name.asString(),
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    });
  }

  async deleteOrder(aggregateId: OrderId, updatedAt: Date): Promise<void> {
    await this.prismaClient.orders.update({
      where: { id: aggregateId.asString() },
      data: { deleted: true, updatedAt: updatedAt },
    });
  }

  async insertOrderItem(aggregateId: OrderId, item: OrderItem, createdAt: Date): Promise<void> {
    await this.prismaClient.orderItems.create({
      data: {
        id: item.id.asString(),
        orderId: aggregateId.asString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    });
  }

  async deleteOrderItem(itemId: OrderItemId): Promise<void> {
    await this.prismaClient.orderItems.delete({
      where: { id: itemId.asString() },
    });
  }

  static of(prismaClient: PrismaClient): OrderDao {
    return new OrderDao(prismaClient);
  }
}

export { OrderDao };
