import "reflect-metadata";
import { createQuerySchema } from "./schema";

describe("createQuerySchema", () => {
  it("builds a schema with queries", async () => {
    const schema = await createQuerySchema();
    const queryType = schema.getQueryType();

    expect(queryType).toBeDefined();
    if (queryType) {
      const fields = queryType.getFields();
      expect(fields.getCart).toBeDefined();
      expect(fields.getCarts).toBeDefined();
      expect(fields.getCartItem).toBeDefined();
      expect(fields.getCartItems).toBeDefined();
    }
  });
});
