import { RepositoryError } from "../order/order-repository";

describe("RepositoryError", () => {
  it("stores name and cause", () => {
    const cause = new Error("cause");
    const error = new RepositoryError("message", cause);
    expect(error.name).toBe("RepositoryError");
    expect(error.cause).toBe(cause);
  });
});
