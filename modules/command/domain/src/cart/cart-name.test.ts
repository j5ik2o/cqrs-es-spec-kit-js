import * as E from "fp-ts/lib/Either";
import { CartName } from "./cart-name";

describe("CartName", () => {
  it("creates and validates a name", () => {
    const name = CartName.of("sample");
    expect(name.asString()).toBe("sample");
    expect(E.isLeft(CartName.validate(""))).toBe(true);
  });
});
