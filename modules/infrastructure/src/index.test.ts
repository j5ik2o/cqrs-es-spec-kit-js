import { generateULID } from "./index";

describe("generateULID", () => {
  it("returns unique, non-empty ids", () => {
    const first = generateULID();
    const second = generateULID();

    expect(first).not.toBe("");
    expect(second).not.toBe("");
    expect(first).not.toBe(second);
  });
});
