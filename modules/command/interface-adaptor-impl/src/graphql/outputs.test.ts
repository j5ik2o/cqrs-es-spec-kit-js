import "reflect-metadata";
import { HealthCheckOutput, CartItemOutput, CartOutput } from "./outputs";

describe("graphql outputs", () => {
  it("allows assigning fields", () => {
    const cartOutput = new CartOutput();
    cartOutput.cartId = "cart";

    const itemOutput = new CartItemOutput();
    itemOutput.cartId = "cart";
    itemOutput.itemId = "item";

    const health = new HealthCheckOutput();
    health.value = "OK";

    expect(cartOutput.cartId).toBe("cart");
    expect(itemOutput.itemId).toBe("item");
    expect(health.value).toBe("OK");
  });
});
