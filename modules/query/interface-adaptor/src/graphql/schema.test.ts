import "reflect-metadata";
import { createQuerySchema } from "./schema";

describe("createQuerySchema", () => {
  it("builds a schema with queries", async () => {
    const schema = await createQuerySchema();
    const queryType = schema.getQueryType();

    expect(queryType).toBeDefined();
    if (queryType) {
      const fields = queryType.getFields();
      expect(fields.getOrder).toBeDefined();
      expect(fields.getOrders).toBeDefined();
      expect(fields.getOrderItem).toBeDefined();
      expect(fields.getOrderItems).toBeDefined();
    }
  });
});
