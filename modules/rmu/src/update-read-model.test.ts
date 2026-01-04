import type { DynamoDBStreamEvent } from "aws-lambda";
import {
  CartId,
  CartItem,
  CartItemId,
  CartName,
  UserAccountId,
} from "cqrs-es-spec-kit-js-command-domain";
import { ReadModelUpdater } from "./update-read-model";
import type { CartDao } from "./cart-dao";

type DaoMock = {
  insertCart: jest.Mock;
  deleteCart: jest.Mock;
  insertCartItem: jest.Mock;
  deleteCartItem: jest.Mock;
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
  insertCart: jest.fn().mockResolvedValue(undefined),
  deleteCart: jest.fn().mockResolvedValue(undefined),
  insertCartItem: jest.fn().mockResolvedValue(undefined),
  deleteCartItem: jest.fn().mockResolvedValue(undefined),
});

describe("ReadModelUpdater", () => {
  it("handles cart created events", async () => {
    const dao = createDao();
    const updater = ReadModelUpdater.of(dao as unknown as CartDao);
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();
    const name = CartName.of("sample");

    const event = encodeEvent({
      type: "CartCreated",
      data: {
        aggregateId: cartId.toJSON(),
        name: name.toJSON(),
        executorId: executorId.toJSON(),
        sequenceNumber: 1,
      },
    });

    await updater.updateReadModel(event);

    expect(dao.insertCart).toHaveBeenCalledTimes(1);
  });

  it("handles cart item events", async () => {
    const dao = createDao();
    const updater = ReadModelUpdater.of(dao as unknown as CartDao);
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();
    const item = CartItem.of(CartItemId.generate(), "item", 1, 100);

    const addedEvent = encodeEvent({
      type: "CartItemAdded",
      data: {
        aggregateId: cartId.toJSON(),
        item: item.toJSON(),
        executorId: executorId.toJSON(),
        sequenceNumber: 2,
      },
    });
    await updater.updateReadModel(addedEvent);
    expect(dao.insertCartItem).toHaveBeenCalledTimes(1);

    const removedEvent = encodeEvent({
      type: "CartItemRemoved",
      data: {
        aggregateId: cartId.toJSON(),
        item: item.toJSON(),
        executorId: executorId.toJSON(),
        sequenceNumber: 3,
      },
    });
    await updater.updateReadModel(removedEvent);
    expect(dao.deleteCartItem).toHaveBeenCalledTimes(1);
  });

  it("handles cart deleted events", async () => {
    const dao = createDao();
    const updater = ReadModelUpdater.of(dao as unknown as CartDao);
    const cartId = CartId.generate();
    const executorId = UserAccountId.generate();

    const event = encodeEvent({
      type: "CartDeleted",
      data: {
        aggregateId: cartId.toJSON(),
        executorId: executorId.toJSON(),
        sequenceNumber: 4,
      },
    });

    await updater.updateReadModel(event);

    expect(dao.deleteCart).toHaveBeenCalledTimes(1);
  });

  it("returns early for missing records", async () => {
    const dao = createDao();
    const updater = ReadModelUpdater.of(dao as unknown as CartDao);

    await updater.updateReadModel({ Records: [{}] } as DynamoDBStreamEvent);

    expect(dao.insertCart).not.toHaveBeenCalled();
    expect(dao.deleteCart).not.toHaveBeenCalled();
  });
});
