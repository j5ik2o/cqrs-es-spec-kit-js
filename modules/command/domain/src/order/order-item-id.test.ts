import * as E from "fp-ts/lib/Either";
import { OrderItemId } from "./order-item-id";

describe("OrderItemId", () => {
  it("generates a valid id with prefix", () => {
    const id = OrderItemId.generate();

    expect(id.asString().startsWith("OrderItem-")).toBe(true);
    expect(OrderItemId.of(id.asString()).equals(id)).toBe(true);
  });

  it("validates values", () => {
    const id = OrderItemId.generate();

    expect(E.isRight(OrderItemId.validate(id.asString()))).toBe(true);
    expect(E.isLeft(OrderItemId.validate("invalid"))).toBe(true);
  });

  it("serializes and compares", () => {
    const id = OrderItemId.generate();
    const same = OrderItemId.of(id.value);

    expect(id.toJSON()).toEqual({ value: id.value });
    expect(id.equals(same)).toBe(true);
    expect(id.toString()).toContain("OrderItemId(");
  });
});
