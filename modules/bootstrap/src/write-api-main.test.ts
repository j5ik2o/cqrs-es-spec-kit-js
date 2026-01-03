import "reflect-metadata";

const startStandaloneServer = jest.fn().mockResolvedValue({ url: "http://localhost:3001" });
const apolloServerConstructor = jest.fn().mockImplementation(() => ({}));
const dynamoConstructor = jest.fn().mockImplementation(() => ({}));
const createCommandSchema = jest.fn().mockResolvedValue({});
const eventStoreFactory = { ofDynamoDB: jest.fn().mockReturnValue({}) };
const orderRepositoryImpl = {
  of: jest.fn().mockReturnValue({
    withRetention: jest.fn().mockReturnValue({}),
  }),
};
const orderCommandProcessor = { of: jest.fn().mockReturnValue({}) };

jest.mock("@apollo/server", () => ({
  ApolloServer: apolloServerConstructor,
}));

jest.mock("@apollo/server/standalone", () => ({
  startStandaloneServer,
}));

jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: dynamoConstructor,
}));

jest.mock("cqrs-es-spec-kit-js-command-interface-adaptor-impl", () => ({
  createCommandSchema,
  OrderRepositoryImpl: orderRepositoryImpl,
}));

jest.mock("cqrs-es-spec-kit-js-command-processor", () => ({
  OrderCommandProcessor: orderCommandProcessor,
}));

jest.mock("event-store-adapter-js", () => ({
  EventStoreFactory: eventStoreFactory,
}));

import { writeApiMain } from "./write-api-main";

describe("writeApiMain", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("creates DynamoDB client with credentials when configured", async () => {
    process.env.AWS_REGION = "ap-northeast-1";
    process.env.AWS_DYNAMODB_ENDPOINT_URL = "http://localhost:8000";
    process.env.AWS_DYNAMODB_ACCESS_KEY_ID = "key";
    process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY = "secret";
    process.env.API_HOST = "127.0.0.1";
    process.env.API_PORT = "4001";

    await writeApiMain();

    expect(dynamoConstructor).toHaveBeenCalledWith({
      region: "ap-northeast-1",
      endpoint: "http://localhost:8000",
      credentials: {
        accessKeyId: "key",
        secretAccessKey: "secret",
      },
    });
    expect(startStandaloneServer).toHaveBeenCalled();
  });

  it("creates DynamoDB client without credentials when not configured", async () => {
    delete process.env.AWS_REGION;
    delete process.env.AWS_DYNAMODB_ENDPOINT_URL;
    delete process.env.AWS_DYNAMODB_ACCESS_KEY_ID;
    delete process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY;

    await writeApiMain();

    expect(dynamoConstructor).toHaveBeenCalledWith();
  });
});
