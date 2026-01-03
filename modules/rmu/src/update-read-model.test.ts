import type { DynamoDBStreamEvent } from "aws-lambda";
import {
  OrderId,
  OrderItem,
  OrderItemId,
  OrderName,
  UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { ReadModelUpdater } from "./update-read-model";
import type { OrderDao } from "./order-dao";

type DaoMock = {
  insertOrder: jest.Mock;
  deleteOrder: jest.Mock;
  insertOrderItem: jest.Mock;
  deleteOrderItem: jest.Mock;
};

const encodeEvent = (payload: object): DynamoDBStreamEvent => {
  const base64 = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
  return {
    Records: [
      {
        dynamodb: {
          NewImage: {
            payload: { B: base64 },
          },
        },
      },
    ],
  } as DynamoDBStreamEvent;
};

const createDao = (): DaoMock => ({
  insertOrder: jest.fn().mockResolvedValue(undefined),
  deleteOrder: jest.fn().mockResolvedValue(undefined),
  insertOrderItem: jest.fn().mockResolvedValue(undefined),
  deleteOrderItem: jest.fn().mockResolvedValue(undefined),
});

describe("ReadModelUpdater", () => {
  it("handles order created events", async () => {
    const dao = createDao();
    const updater = ReadModelUpdater.of(dao as unknown as OrderDao);
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();
    const name = OrderName.of("sample");

    const event = encodeEvent({
      type: "OrderCreated",
      data: {
        aggregateId: orderId.toJSON(),
        name: name.toJSON(),
        executorId: executorId.toJSON(),
        sequenceNumber: 1,
      },
    });

    await updater.updateReadModel(event);

    expect(dao.insertOrder).toHaveBeenCalledTimes(1);
  });

  it("handles order item events", async () => {
    const dao = createDao();
    const updater = ReadModelUpdater.of(dao as unknown as OrderDao);
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();
    const item = OrderItem.of(OrderItemId.generate(), "item", 1, 100);

    const addedEvent = encodeEvent({
      type: "OrderItemAdded",
      data: {
        aggregateId: orderId.toJSON(),
        item: item.toJSON(),
        executorId: executorId.toJSON(),
        sequenceNumber: 2,
      },
    });
    await updater.updateReadModel(addedEvent);
    expect(dao.insertOrderItem).toHaveBeenCalledTimes(1);

    const removedEvent = encodeEvent({
      type: "OrderItemRemoved",
      data: {
        aggregateId: orderId.toJSON(),
        item: item.toJSON(),
        executorId: executorId.toJSON(),
        sequenceNumber: 3,
      },
    });
    await updater.updateReadModel(removedEvent);
    expect(dao.deleteOrderItem).toHaveBeenCalledTimes(1);
  });

  it("handles order deleted events", async () => {
    const dao = createDao();
    const updater = ReadModelUpdater.of(dao as unknown as OrderDao);
    const orderId = OrderId.generate();
    const executorId = UserAccountId.generate();

    const event = encodeEvent({
      type: "OrderDeleted",
      data: {
        aggregateId: orderId.toJSON(),
        executorId: executorId.toJSON(),
        sequenceNumber: 4,
      },
    });

    await updater.updateReadModel(event);

    expect(dao.deleteOrder).toHaveBeenCalledTimes(1);
  });

  it("returns early for missing records", async () => {
    const dao = createDao();
    const updater = ReadModelUpdater.of(dao as unknown as OrderDao);

    await updater.updateReadModel({ Records: [{}] } as DynamoDBStreamEvent);

    expect(dao.insertOrder).not.toHaveBeenCalled();
    expect(dao.deleteOrder).not.toHaveBeenCalled();
  });
});
