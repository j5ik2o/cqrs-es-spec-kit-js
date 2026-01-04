const dynamoConstructor = jest.fn();
const streamsConstructor = jest.fn();
const defaultSendDynamoImpl = async (): Promise<{ Table?: { LatestStreamArn?: string } }> => ({
  Table: {
    LatestStreamArn: "arn:stream",
  },
});
const sendDynamo = jest.fn(defaultSendDynamoImpl);
const defaultSendStreamsImpl = async (command: { constructor: { name: string } }): Promise<any> => {
  const name = command.constructor.name;
  if (name === "DescribeStreamCommand") {
    return {
      StreamDescription: {
        Shards: [{ ShardId: "shard-1" }],
      },
    };
  }
  if (name === "GetShardIteratorCommand") {
    return { ShardIterator: "iterator" };
  }
  if (name === "GetRecordsCommand") {
    return {
      Records: [
        {
          awsRegion: "ap-northeast-1",
          dynamodb: {
            ApproximateCreationDateTime: new Date(),
            Keys: {
              id: { S: "id" },
            },
            NewImage: {
              s: { S: "value" },
              n: { N: "1" },
              b: { B: Buffer.from("bin") },
              bool: { BOOL: true },
              null: { NULL: true },
              bs: { BS: [Buffer.from("a"), Buffer.from("b")] },
              ss: { SS: ["a", "b"] },
              ns: { NS: ["1", "2"] },
              l: { L: [{ S: "nested" }] },
              m: { M: { nested: { S: "value" } } },
            },
            SequenceNumber: "1",
            SizeBytes: 1,
            StreamViewType: "NEW_IMAGE",
          },
          eventID: "1",
          eventName: "INSERT",
          eventSource: "aws:dynamodb",
          eventVersion: "1.0",
        },
      ],
      NextShardIterator: "next",
    };
  }
  throw new Error(`Unexpected command: ${name}`);
};
const sendStreams = jest.fn(defaultSendStreamsImpl);

class DynamoDBClient {
  public send = sendDynamo;
  constructor(options?: unknown) {
    dynamoConstructor(options);
  }
}

class DynamoDBStreamsClient {
  public send = sendStreams;
  constructor(options?: unknown) {
    streamsConstructor(options);
  }
}

class DescribeTableCommand {
  constructor(public input: unknown) {}
}
class DescribeStreamCommand {
  constructor(public input: unknown) {}
}
class GetShardIteratorCommand {
  constructor(public input: unknown) {}
}
class GetRecordsCommand {
  constructor(public input: unknown) {}
}

jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient,
  DescribeTableCommand,
}));

jest.mock("@aws-sdk/client-dynamodb-streams", () => ({
  DynamoDBStreamsClient,
  DescribeStreamCommand,
  GetShardIteratorCommand,
  GetRecordsCommand,
}));

const prismaOn = jest.fn();
const prismaConstructor = jest.fn().mockImplementation(() => ({
  $on: prismaOn,
}));

jest.mock("@prisma/client", () => ({
  PrismaClient: prismaConstructor,
}));

const updateReadModel = jest.fn().mockResolvedValue(undefined);
const cartDaoOf = jest.fn().mockReturnValue({});
const readModelUpdaterOf = jest.fn().mockReturnValue({ updateReadModel });

jest.mock("cqrs-es-spec-kit-js-rmu", () => ({
  CartDao: { of: cartDaoOf },
  ReadModelUpdater: { of: readModelUpdaterOf },
}));

import { localRmuMain } from "./local-rmu-main";

describe("localRmuMain", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    sendDynamo.mockImplementation(defaultSendDynamoImpl);
    sendStreams.mockImplementation(defaultSendStreamsImpl);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    await expect(localRmuMain({ maxIterations: 1 })).rejects.toThrow("DATABASE_URL is not set");
  });

  it("runs stream processing with configured clients", async () => {
    process.env.DATABASE_URL = "postgres://localhost";
    process.env.AWS_REGION = "ap-northeast-1";
    process.env.AWS_DYNAMODB_ENDPOINT_URL = "http://localhost:8000";
    process.env.AWS_DYNAMODB_ACCESS_KEY_ID = "key";
    process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY = "secret";
    process.env.STREAM_MAX_ITEM_COUNT = "1";

    await localRmuMain({ maxIterations: 1 });

    expect(dynamoConstructor).toHaveBeenCalledWith({
      region: "ap-northeast-1",
      endpoint: "http://localhost:8000",
      credentials: {
        accessKeyId: "key",
        secretAccessKey: "secret",
      },
    });
    expect(streamsConstructor).toHaveBeenCalledWith({
      region: "ap-northeast-1",
      endpoint: "http://localhost:8000",
      credentials: {
        accessKeyId: "key",
        secretAccessKey: "secret",
      },
    });
    expect(updateReadModel).toHaveBeenCalledTimes(1);
    expect(prismaOn).toHaveBeenCalledTimes(1);
    const queryCallback = prismaOn.mock.calls[0][1];
    await queryCallback({ query: "SELECT 1", params: "[]", duration: 1 });
  });

  it("uses default clients when credentials are not provided", async () => {
    process.env.DATABASE_URL = "postgres://localhost";
    process.env.STREAM_MAX_ITEM_COUNT = "1";

    await localRmuMain({ maxIterations: 1 });

    expect(dynamoConstructor.mock.calls[0]?.[0]).toBeUndefined();
    expect(streamsConstructor.mock.calls[0]?.[0]).toBeUndefined();
  });

  it("handles missing stream ARN without throwing", async () => {
    process.env.DATABASE_URL = "postgres://localhost";
    process.env.STREAM_MAX_ITEM_COUNT = "1";
    sendDynamo.mockResolvedValueOnce({ Table: {} });

    await expect(localRmuMain({ maxIterations: 1 })).resolves.toBeUndefined();

    expect(updateReadModel).not.toHaveBeenCalled();
  });

  it("handles record without keys", async () => {
    process.env.DATABASE_URL = "postgres://localhost";
    process.env.STREAM_MAX_ITEM_COUNT = "1";
    sendStreams.mockImplementation(async (command) => {
      const name = command.constructor.name;
      if (name === "DescribeStreamCommand") {
        return {
          StreamDescription: {
            Shards: [{ ShardId: "shard-1" }],
          },
        };
      }
      if (name === "GetShardIteratorCommand") {
        return { ShardIterator: "iterator" };
      }
      if (name === "GetRecordsCommand") {
        return {
          Records: [
            {
              awsRegion: "ap-northeast-1",
              dynamodb: {
                ApproximateCreationDateTime: new Date(),
                NewImage: {
                  s: { S: "value" },
                },
                SequenceNumber: "1",
                SizeBytes: 1,
                StreamViewType: "NEW_IMAGE",
              },
              eventID: "1",
              eventName: "INSERT",
              eventSource: "aws:dynamodb",
              eventVersion: "1.0",
            },
          ],
          NextShardIterator: "next",
        };
      }
      throw new Error(`Unexpected command: ${name}`);
    });

    await expect(localRmuMain({ maxIterations: 1 })).resolves.toBeUndefined();

    expect(updateReadModel).not.toHaveBeenCalled();
  });
});
