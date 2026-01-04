import * as E from "fp-ts/lib/Either";
import { CartId } from "./cart-id";

describe("CartId", () => {
  it("generates a valid id with prefix", () => {
    const id = CartId.generate();

    expect(id.asString().startsWith("Cart-")).toBe(true);
    expect(CartId.of(id.asString()).equals(id)).toBe(true);
  });

  it("validates values", () => {
    const id = CartId.generate();

    expect(E.isRight(CartId.validate(id.asString()))).toBe(true);
    expect(E.isLeft(CartId.validate("invalid"))).toBe(true);
  });

  it("serializes and compares", () => {
    const id = CartId.generate();
    const same = CartId.of(id.value);

    expect(id.toJSON()).toEqual({ value: id.value });
    expect(id.equals(same)).toBe(true);
    expect(id.toString()).toContain("CartId(");
  });
});
