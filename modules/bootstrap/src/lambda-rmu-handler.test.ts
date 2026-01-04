const prismaOn = jest.fn();
const prismaConstructor = jest.fn().mockImplementation(() => ({
  $on: prismaOn,
}));
const updateReadModel = jest.fn().mockResolvedValue(undefined);
const cartDaoOf = jest.fn().mockReturnValue({});
const readModelUpdaterOf = jest.fn().mockReturnValue({ updateReadModel });

jest.mock("@prisma/client", () => ({
  PrismaClient: prismaConstructor,
}));

jest.mock("cqrs-es-spec-kit-js-rmu", () => ({
  CartDao: { of: cartDaoOf },
  ReadModelUpdater: { of: readModelUpdaterOf },
}));

describe("handler", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;
    jest.resetModules();
    const { handler } = await import("./lambda-rmu-handler");

    await expect(handler({ Records: [] } as never, {} as never, jest.fn() as never)).rejects.toThrow(
      "DATABASE_URL environment variable is not set",
    );
  });

  it("initializes prisma once and updates read model", async () => {
    process.env.DATABASE_URL = "postgres://localhost";
    jest.resetModules();
    const { handler } = await import("./lambda-rmu-handler");

    await handler({ Records: [] } as never, {} as never, jest.fn() as never);
    await handler({ Records: [] } as never, {} as never, jest.fn() as never);

    expect(prismaConstructor).toHaveBeenCalledTimes(1);
    expect(readModelUpdaterOf).toHaveBeenCalledTimes(1);
    expect(updateReadModel).toHaveBeenCalledTimes(2);
    expect(prismaOn).toHaveBeenCalledTimes(1);
    const queryCallback = prismaOn.mock.calls[0][1];
    queryCallback({ query: "SELECT 1", params: "[]", duration: 1 });
  });

  it("throws when ReadModelUpdater is not initialized", async () => {
    process.env.DATABASE_URL = "postgres://localhost";
    readModelUpdaterOf.mockReturnValueOnce(undefined as never);
    jest.resetModules();
    const { handler } = await import("./lambda-rmu-handler");

    await expect(handler({ Records: [] } as never, {} as never, jest.fn() as never)).rejects.toThrow(
      "ReadModelUpdater is not initialized",
    );
  });

  it("rethrows when updateReadModel fails", async () => {
    process.env.DATABASE_URL = "postgres://localhost";
    updateReadModel.mockRejectedValueOnce(new Error("boom"));
    jest.resetModules();
    const { handler } = await import("./lambda-rmu-handler");

    await expect(handler({ Records: [] } as never, {} as never, jest.fn() as never)).rejects.toThrow("boom");
  });
});
