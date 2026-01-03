import "reflect-metadata";
import { HealthCheckOutput, OrderItemOutput, OrderOutput } from "./outputs";

describe("graphql outputs", () => {
  it("allows assigning fields", () => {
    const orderOutput = new OrderOutput();
    orderOutput.orderId = "order";

    const itemOutput = new OrderItemOutput();
    itemOutput.orderId = "order";
    itemOutput.itemId = "item";

    const health = new HealthCheckOutput();
    health.value = "OK";

    expect(orderOutput.orderId).toBe("order");
    expect(itemOutput.itemId).toBe("item");
    expect(health.value).toBe("OK");
  });
});
