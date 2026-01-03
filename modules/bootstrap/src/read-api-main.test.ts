import "reflect-metadata";

const startStandaloneServer = jest.fn().mockResolvedValue({ url: "http://localhost:3000" });
const apolloServerConstructor = jest.fn().mockImplementation(() => ({}));
const prismaOn = jest.fn();
const prismaConstructor = jest.fn().mockImplementation(() => ({ $on: prismaOn }));
const createQuerySchema = jest.fn().mockResolvedValue({});

jest.mock("@apollo/server", () => ({
  ApolloServer: apolloServerConstructor,
}));

jest.mock("@apollo/server/standalone", () => ({
  startStandaloneServer,
}));

jest.mock("@prisma/client", () => ({
  PrismaClient: prismaConstructor,
}));

jest.mock("cqrs-es-spec-kit-js-query-interface-adaptor", () => ({
  createQuerySchema,
}));

import { readApiMain } from "./read-api-main";

describe("readApiMain", () => {
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

    await expect(readApiMain()).rejects.toThrow("DATABASE_URL is not set");
  });

  it("starts server with configured host and port", async () => {
    process.env.DATABASE_URL = "postgres://localhost";
    process.env.API_HOST = "127.0.0.1";
    process.env.API_PORT = "4000";

    await readApiMain();

    expect(prismaConstructor).toHaveBeenCalledTimes(1);
    expect(createQuerySchema).toHaveBeenCalledTimes(1);
    expect(apolloServerConstructor).toHaveBeenCalledTimes(1);
    expect(startStandaloneServer).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        listen: { host: "127.0.0.1", port: 4000 },
      }),
    );
  });
});
