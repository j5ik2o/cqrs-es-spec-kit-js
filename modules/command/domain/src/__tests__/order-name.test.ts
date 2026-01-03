import * as E from "fp-ts/lib/Either";
import { OrderName } from "../order/order-name";

describe("OrderName", () => {
  it("creates and validates a name", () => {
    const name = OrderName.of("sample");
    expect(name.asString()).toBe("sample");
    expect(E.isLeft(OrderName.validate(""))).toBe(true);
  });
});
