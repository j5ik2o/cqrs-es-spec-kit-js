import "reflect-metadata";
import { OrderQueryResolver } from "./resolvers";

describe("OrderQueryResolver", () => {
  it("returns a single order", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: "order",
          name: "sample",
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    };
    const resolver = new OrderQueryResolver();

    const result = await resolver.getOrder({ prisma } as never, "order");

    expect(result.id).toBe("order");
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("throws when order is missing", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([]),
    };
    const resolver = new OrderQueryResolver();

    await expect(resolver.getOrder({ prisma } as never, "order")).rejects.toThrow("Order not found");
  });

  it("returns orders", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: "order-1",
          name: "sample",
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "order-2",
          name: "sample",
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    };
    const resolver = new OrderQueryResolver();

    const result = await resolver.getOrders({ prisma } as never);

    expect(result).toHaveLength(2);
  });

  it("normalizes order item values", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: "item",
          orderId: "order",
          name: "item",
          quantity: "2",
          price: "100",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    };
    const resolver = new OrderQueryResolver();

    const result = await resolver.getOrderItem({ prisma } as never, "item");

    expect(result.quantity).toBe(2);
    expect(result.price).toBe(100);
  });

  it("returns order items", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: "item-1",
          orderId: "order",
          name: "item",
          quantity: 1,
          price: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "item-2",
          orderId: "order",
          name: "item",
          quantity: 2,
          price: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    };
    const resolver = new OrderQueryResolver();

    const result = await resolver.getOrderItems({ prisma } as never, "order");

    expect(result).toHaveLength(2);
    expect(result[1].quantity).toBe(2);
  });

  it("throws when order item is missing", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([]),
    };
    const resolver = new OrderQueryResolver();

    await expect(resolver.getOrderItem({ prisma } as never, "item")).rejects.toThrow("Order item not found");
  });
});
