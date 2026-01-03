import type { PrismaClient } from "@prisma/client";
import { OrderDao } from "../order-dao";

describe("OrderDao", () => {
  it("can be created with a prisma client", () => {
    const prisma = {} as PrismaClient;
    const dao = OrderDao.of(prisma);
    expect(dao).toBeInstanceOf(OrderDao);
  });
});
