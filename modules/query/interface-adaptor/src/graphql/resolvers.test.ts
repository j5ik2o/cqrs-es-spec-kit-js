import "reflect-metadata";
import { CartQueryResolver } from "./resolvers";

describe("CartQueryResolver", () => {
  it("returns a single cart", async () => {
    const prisma = {
      carts: {
        findUnique: jest.fn().mockResolvedValue({
          id: "cart",
          name: "sample",
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    };
    const resolver = new CartQueryResolver();

    const result = await resolver.getCart({ prisma } as never, "cart");

    expect(result.id).toBe("cart");
    expect(prisma.carts.findUnique).toHaveBeenCalledTimes(1);
  });

  it("throws when cart is missing", async () => {
    const prisma = {
      carts: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const resolver = new CartQueryResolver();

    await expect(resolver.getCart({ prisma } as never, "cart")).rejects.toThrow("Cart not found");
  });

  it("returns carts", async () => {
    const prisma = {
      carts: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "cart-1",
            name: "sample",
            deleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "cart-2",
            name: "sample",
            deleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      },
    };
    const resolver = new CartQueryResolver();

    const result = await resolver.getCarts({ prisma } as never);

    expect(result).toHaveLength(2);
  });

  it("normalizes cart item values", async () => {
    const prisma = {
      cartItems: {
        findUnique: jest.fn().mockResolvedValue({
          id: "item",
          cartId: "cart",
          name: "item",
          quantity: 2,
          price: "100",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    };
    const resolver = new CartQueryResolver();

    const result = await resolver.getCartItem({ prisma } as never, "item");

    expect(result.quantity).toBe(2);
    expect(result.price).toBe(100);
  });

  it("returns cart items", async () => {
    const prisma = {
      cartItems: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "item-1",
            cartId: "cart",
            name: "item",
            quantity: 1,
            price: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "item-2",
            cartId: "cart",
            name: "item",
            quantity: 2,
            price: 200,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      },
    };
    const resolver = new CartQueryResolver();

    const result = await resolver.getCartItems({ prisma } as never, "cart");

    expect(result).toHaveLength(2);
    expect(result[1].quantity).toBe(2);
  });

  it("throws when cart item is missing", async () => {
    const prisma = {
      cartItems: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const resolver = new CartQueryResolver();

    await expect(resolver.getCartItem({ prisma } as never, "item")).rejects.toThrow("Cart item not found");
  });
});
