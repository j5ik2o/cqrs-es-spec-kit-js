import * as E from "fp-ts/lib/Either";
import { UserAccountId } from "./user-account-id";

describe("UserAccountId", () => {
  it("generates a valid id with prefix", () => {
    const id = UserAccountId.generate();

    expect(id.asString().startsWith("UserAccount-")).toBe(true);
    expect(UserAccountId.of(id.asString()).equals(id)).toBe(true);
  });

  it("validates values", () => {
    const id = UserAccountId.generate();

    expect(E.isRight(UserAccountId.validate(id.asString()))).toBe(true);
    expect(E.isLeft(UserAccountId.validate("invalid"))).toBe(true);
  });

  it("serializes and compares", () => {
    const id = UserAccountId.generate();
    const same = UserAccountId.of(id.value);

    expect(id.toJSON()).toEqual({ value: id.value });
    expect(id.equals(same)).toBe(true);
    expect(id.toString()).toContain("UserAccountId(");
  });
});
