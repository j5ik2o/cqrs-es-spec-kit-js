import * as E from "fp-ts/lib/Either";
import { CartItemId } from "./cart-item-id";

describe("CartItemId", () => {
  it("generates a valid id with prefix", () => {
    const id = CartItemId.generate();

    expect(id.asString().startsWith("CartItem-")).toBe(true);
    expect(CartItemId.of(id.asString()).equals(id)).toBe(true);
  });

  it("validates values", () => {
    const id = CartItemId.generate();

    expect(E.isRight(CartItemId.validate(id.asString()))).toBe(true);
    expect(E.isLeft(CartItemId.validate("invalid"))).toBe(true);
  });

  it("serializes and compares", () => {
    const id = CartItemId.generate();
    const same = CartItemId.of(id.value);

    expect(id.toJSON()).toEqual({ value: id.value });
    expect(id.equals(same)).toBe(true);
    expect(id.toString()).toContain("CartItemId(");
  });
});
