import { ProcessNotFoundError } from "../order/order-command-processor";

describe("ProcessNotFoundError", () => {
  it("sets name", () => {
    const error = new ProcessNotFoundError("missing");
    expect(error.name).toBe("ProcessNotFoundError");
  });
});
