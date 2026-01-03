import "reflect-metadata";
import { OrderQueryResolver } from "../graphql/resolvers";

describe("OrderQueryResolver", () => {
  it("can be instantiated", () => {
    const resolver = new OrderQueryResolver();
    expect(typeof resolver.getOrders).toBe("function");
  });
});
