import type { PrismaClient } from "@prisma/client";
import { type ILogObj, Logger } from "tslog";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { OrderItemQueryOutput, OrderQueryOutput } from "./outputs";

type OrderItemRow = Omit<OrderItemQueryOutput, "quantity" | "price"> & {
  quantity: number | string | bigint;
  price: number | string | bigint;
};

interface QueryContext {
  prisma: PrismaClient;
}

@Resolver()
class OrderQueryResolver {
  private readonly logger: Logger<ILogObj> = new Logger();

  @Query(() => OrderQueryOutput)
  async getOrder(@Ctx() { prisma }: QueryContext, @Arg("orderId") orderId: string): Promise<OrderQueryOutput> {
    const orders: OrderQueryOutput[] = await prisma.$queryRaw<OrderQueryOutput[]>`
        SELECT
            o.id as id,
            o.name as name,
            o.deleted as deleted,
            o.created_at as createdAt,
            o.updated_at as updatedAt
        FROM
            orders AS o
        WHERE
            o.id = ${orderId}`;
    this.logger.debug("getOrder:", orders);
    if (!orders.length) {
      throw new Error("Order not found");
    }
    this.logger.debug("order:", orders[0]);
    return orders[0];
  }

  @Query(() => [OrderQueryOutput])
  async getOrders(@Ctx() { prisma }: QueryContext): Promise<OrderQueryOutput[]> {
    const orders: OrderQueryOutput[] = await prisma.$queryRaw<OrderQueryOutput[]>`
        SELECT
            o.id as id,
            o.name as name,
            o.deleted as deleted,
            o.created_at as createdAt,
            o.updated_at as updatedAt
        FROM
            orders AS o
        WHERE
            o.deleted = false`;
    this.logger.debug("getOrders:", orders);
    return orders;
  }

  @Query(() => OrderItemQueryOutput)
  async getOrderItem(
    @Ctx() { prisma }: QueryContext,
    @Arg("orderItemId") orderItemId: string,
  ): Promise<OrderItemQueryOutput> {
    const items: OrderItemRow[] = await prisma.$queryRaw<OrderItemRow[]>`
        SELECT
            oi.id as id,
            oi.order_id as orderId,
            oi.name as name,
            oi.quantity as quantity,
            oi.price as price,
            oi.created_at as createdAt,
            oi.updated_at as updatedAt
        FROM
            order_items AS oi
        WHERE
            oi.id = ${orderItemId}`;
    if (!items.length) {
      throw new Error("Order item not found");
    }
    this.logger.debug("orderItem:", items[0]);
    return this.normalizeOrderItem(items[0]);
  }

  @Query(() => [OrderItemQueryOutput])
  async getOrderItems(
    @Ctx() { prisma }: QueryContext,
    @Arg("orderId") orderId: string,
  ): Promise<OrderItemQueryOutput[]> {
    const items: OrderItemRow[] = await prisma.$queryRaw<OrderItemRow[]>`
        SELECT
            oi.id as id,
            oi.order_id as orderId,
            oi.name as name,
            oi.quantity as quantity,
            oi.price as price,
            oi.created_at as createdAt,
            oi.updated_at as updatedAt
        FROM
            orders AS o JOIN order_items AS oi ON o.id = oi.order_id
        WHERE
            o.deleted = false AND oi.order_id = ${orderId}`;
    this.logger.debug("orderItems:", items);
    return items.map((item) => this.normalizeOrderItem(item));
  }

  private normalizeOrderItem(item: OrderItemRow): OrderItemQueryOutput {
    return {
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
    };
  }
}

export { type QueryContext, OrderQueryResolver };
