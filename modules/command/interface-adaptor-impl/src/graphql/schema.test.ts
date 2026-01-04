import "reflect-metadata";
import { createCommandSchema } from "./schema";

describe("createCommandSchema", () => {
  it("builds a schema with mutations", async () => {
    const schema = await createCommandSchema();
    const mutationType = schema.getMutationType();

    expect(mutationType).toBeDefined();
    if (mutationType) {
      const fields = mutationType.getFields();
      expect(fields.createCart).toBeDefined();
      expect(fields.addItemToCart).toBeDefined();
      expect(fields.removeItemFromCart).toBeDefined();
      expect(fields.deleteCart).toBeDefined();
    }
  });
});
