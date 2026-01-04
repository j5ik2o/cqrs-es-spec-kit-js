import { CartId, CartItem, CartItemId, CartName } from "cqrs-es-spec-kit-js-command-domain";
import { CartDao } from "./cart-dao";

describe("CartDao", () => {
  it("persists carts and items via prisma client", async () => {
    const prisma = {
      carts: {
        create: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      },
      cartItems: {
        create: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      },
    };
    const dao = CartDao.of(prisma as never);
    const cartId = CartId.generate();
    const name = CartName.of("sample");
    const item = CartItem.of(CartItemId.generate(), "apple", 1, 100);
    const now = new Date();

    await dao.insertCart(cartId, name, now);
    await dao.deleteCart(cartId, now);
    await dao.insertCartItem(cartId, item, now);
    await dao.deleteCartItem(item.id);

    expect(prisma.carts.create).toHaveBeenCalledWith({
      data: {
        id: cartId.asString(),
        deleted: false,
        name: name.asString(),
        createdAt: now,
        updatedAt: now,
      },
    });
    expect(prisma.carts.update).toHaveBeenCalledWith({
      where: { id: cartId.asString() },
      data: { deleted: true, updatedAt: now },
    });
    expect(prisma.cartItems.create).toHaveBeenCalledWith({
      data: {
        id: item.id.asString(),
        cartId: cartId.asString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        createdAt: now,
        updatedAt: now,
      },
    });
    expect(prisma.cartItems.delete).toHaveBeenCalledWith({
      where: { id: item.id.asString() },
    });
  });
});
