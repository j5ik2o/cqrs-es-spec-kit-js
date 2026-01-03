import * as E from "fp-ts/lib/Either";
import { OrderId } from "./order-id";

describe("OrderId", () => {
  it("generates a valid id with prefix", () => {
    const id = OrderId.generate();

    expect(id.asString().startsWith("Order-")).toBe(true);
    expect(OrderId.of(id.asString()).equals(id)).toBe(true);
  });

  it("validates values", () => {
    const id = OrderId.generate();

    expect(E.isRight(OrderId.validate(id.asString()))).toBe(true);
    expect(E.isLeft(OrderId.validate("invalid"))).toBe(true);
  });

  it("serializes and compares", () => {
    const id = OrderId.generate();
    const same = OrderId.of(id.value);

    expect(id.toJSON()).toEqual({ value: id.value });
    expect(id.equals(same)).toBe(true);
    expect(id.toString()).toContain("OrderId(");
  });
});
