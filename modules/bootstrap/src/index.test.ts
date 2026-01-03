import { logger } from "./index";

describe("index", () => {
  it("exposes a logger", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
  });
});
