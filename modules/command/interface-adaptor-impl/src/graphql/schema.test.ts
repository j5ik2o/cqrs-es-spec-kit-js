import "reflect-metadata";
import { createCommandSchema } from "./schema";

describe("createCommandSchema", () => {
  it("builds a schema with mutations", async () => {
    const schema = await createCommandSchema();
    const mutationType = schema.getMutationType();

    expect(mutationType).toBeDefined();
    if (mutationType) {
      const fields = mutationType.getFields();
      expect(fields.createOrder).toBeDefined();
      expect(fields.addItem).toBeDefined();
      expect(fields.removeItem).toBeDefined();
      expect(fields.deleteOrder).toBeDefined();
    }
  });
});
