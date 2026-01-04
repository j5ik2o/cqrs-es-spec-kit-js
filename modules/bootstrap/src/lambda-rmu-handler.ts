import { type Prisma, PrismaClient } from "@prisma/client";
import type { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import { CartDao, ReadModelUpdater } from "cqrs-es-spec-kit-js-rmu";
import { type ILogObj, Logger } from "tslog";
import type { PrismaQueryEvent } from "./types";

const logger: Logger<ILogObj> = new Logger({
  name: "lambda-rmu-handler",
});

// Lambda関数外でPrismaClientを初期化（接続再利用のため）
let prisma: PrismaClient<Prisma.PrismaClientOptions, "query"> | undefined;
let readModelUpdater: ReadModelUpdater | undefined;

function initializePrisma(): void {
  if (!prisma) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    logger.info("Initializing Prisma Client");
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: [
        { level: "query", emit: "event" },
        { level: "error", emit: "event" },
        { level: "warn", emit: "event" },
      ],
    });

    prisma.$on("query", (e: PrismaQueryEvent) => {
      logger.debug(`Query: ${e.query}`);
      logger.debug(`Params: ${e.params}`);
      logger.debug(`Duration: ${e.duration}ms`);
    });

    const dao = CartDao.of(prisma);
    readModelUpdater = ReadModelUpdater.of(dao);
    logger.info("Prisma Client and ReadModelUpdater initialized");
  }
}

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent): Promise<void> => {
  logger.info("Lambda function invoked", {
    recordCount: event.Records.length,
  });

  try {
    // 初回またはコールドスタート時にPrismaを初期化
    initializePrisma();

    if (!readModelUpdater) {
      throw new Error("ReadModelUpdater is not initialized");
    }

    // ReadModelUpdaterでイベント処理
    await readModelUpdater.updateReadModel(event);

    logger.info("Successfully processed DynamoDB Stream event", {
      recordCount: event.Records.length,
    });
  } catch (error) {
    logger.error("Failed to process DynamoDB Stream event", error);
    // Lambdaにエラーを通知してリトライさせる
    throw error;
  }
};
