import { OrderId, OrderItem, OrderItemId, OrderName } from "cqrs-es-spec-kit-js-command-domain";
import { OrderDao } from "./order-dao";

describe("OrderDao", () => {
  it("persists orders and items via prisma client", async () => {
    const prisma = {
      orders: {
        create: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      },
      orderItems: {
        create: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      },
    };
    const dao = OrderDao.of(prisma as never);
    const orderId = OrderId.generate();
    const name = OrderName.of("sample");
    const item = OrderItem.of(OrderItemId.generate(), "apple", 1, 100);
    const now = new Date();

    await dao.insertOrder(orderId, name, now);
    await dao.deleteOrder(orderId, now);
    await dao.insertOrderItem(orderId, item, now);
    await dao.deleteOrderItem(item.id);

    expect(prisma.orders.create).toHaveBeenCalledWith({
      data: {
        id: orderId.asString(),
        deleted: false,
        name: name.asString(),
        createdAt: now,
        updatedAt: now,
      },
    });
    expect(prisma.orders.update).toHaveBeenCalledWith({
      where: { id: orderId.asString() },
      data: { deleted: true, updatedAt: now },
    });
    expect(prisma.orderItems.create).toHaveBeenCalledWith({
      data: {
        id: item.id.asString(),
        orderId: orderId.asString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        createdAt: now,
        updatedAt: now,
      },
    });
    expect(prisma.orderItems.delete).toHaveBeenCalledWith({
      where: { id: item.id.asString() },
    });
  });
});
