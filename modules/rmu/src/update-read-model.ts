import { TextDecoder } from "node:util";
import type { DynamoDBStreamEvent } from "aws-lambda";
import {
  type OrderCreated,
  OrderCreatedTypeSymbol,
  type OrderDeleted,
  OrderDeletedTypeSymbol,
  type OrderItemAdded,
  OrderItemAddedTypeSymbol,
  type OrderItemRemoved,
  OrderItemRemovedTypeSymbol,
  convertJSONToOrderEvent,
} from "cqrs-es-spec-kit-js-command-domain";
import { type ILogObj, Logger } from "tslog";
import type { OrderDao } from "./order-dao";

class ReadModelUpdater {
  private logger: Logger<ILogObj> = new Logger();
  private decoder: TextDecoder = new TextDecoder("utf-8");

  private constructor(private readonly orderDao: OrderDao) {}

  async updateReadModel(event: DynamoDBStreamEvent): Promise<void> {
    this.logger.info(`EVENT: \n${JSON.stringify(event, null, 2)}`);
    for (const record of event.Records) {
      if (!record.dynamodb) {
        this.logger.warn("No DynamoDB record");
        return;
      }
      const attributeValues = record.dynamodb.NewImage;
      if (!attributeValues) {
        this.logger.warn("No NewImage");
        return;
      }
      const base64EncodedPayload = attributeValues.payload.B;
      if (!base64EncodedPayload) {
        this.logger.warn("No payload");
        return;
      }
      const payload = this.decoder.decode(
        new Uint8Array(base64EncodedPayload.split(",").map(Number)),
      );
      const payloadJson = JSON.parse(payload);
      const orderEvent = convertJSONToOrderEvent(payloadJson);
      switch (orderEvent.symbol) {
        case OrderCreatedTypeSymbol: {
          const typedEvent = orderEvent as OrderCreated;
          this.logger.debug(`event = ${typedEvent.toString()}`);
          await this.orderDao.insertOrder(
            typedEvent.aggregateId,
            typedEvent.name,
            new Date(),
          );
          this.logger.debug("inserted order");
          break;
        }
        case OrderDeletedTypeSymbol: {
          const typedEvent = orderEvent as OrderDeleted;
          this.logger.debug(`event = ${typedEvent.toString()}`);
          await this.orderDao.deleteOrder(typedEvent.aggregateId, new Date());
          this.logger.debug("deleted order");
          break;
        }
        case OrderItemAddedTypeSymbol: {
          const typedEvent = orderEvent as OrderItemAdded;
          this.logger.debug(`event = ${typedEvent.toString()}`);
          await this.orderDao.insertOrderItem(
            typedEvent.aggregateId,
            typedEvent.item,
            new Date(),
          );
          this.logger.debug("inserted order item");
          break;
        }
        case OrderItemRemovedTypeSymbol: {
          const typedEvent = orderEvent as OrderItemRemoved;
          this.logger.debug(`event = ${typedEvent.toString()}`);
          await this.orderDao.deleteOrderItem(typedEvent.item.id);
          this.logger.debug("deleted order item");
          break;
        }
      }
    }
  }

  static of(orderDao: OrderDao): ReadModelUpdater {
    return new ReadModelUpdater(orderDao);
  }
}

export { ReadModelUpdater };
