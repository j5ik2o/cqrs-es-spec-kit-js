import type { DynamoDBStreamEvent } from "aws-lambda";
import {
  type CartCreated,
  CartCreatedTypeSymbol,
  type CartDeleted,
  CartDeletedTypeSymbol,
  type CartItemAdded,
  CartItemAddedTypeSymbol,
  type CartItemRemoved,
  CartItemRemovedTypeSymbol,
  convertJSONToCartEvent,
} from "cqrs-es-spec-kit-js-command-domain";
import { type ILogObj, Logger } from "tslog";
import type { CartDao } from "./cart-dao";

class ReadModelUpdater {
  private logger: Logger<ILogObj> = new Logger();

  private constructor(private readonly cartDao: CartDao) {}

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
      // Decode base64-encoded binary payload from DynamoDB Streams
      const payload = Buffer.from(base64EncodedPayload, "base64").toString("utf-8");
      const payloadJson = JSON.parse(payload);
      const cartEvent = convertJSONToCartEvent(payloadJson);
      switch (cartEvent.symbol) {
        case CartCreatedTypeSymbol: {
          const typedEvent = cartEvent as CartCreated;
          this.logger.debug(`event = ${typedEvent.toString()}`);
          await this.cartDao.insertCart(typedEvent.aggregateId, typedEvent.name, new Date());
          this.logger.debug("inserted cart");
          break;
        }
        case CartDeletedTypeSymbol: {
          const typedEvent = cartEvent as CartDeleted;
          this.logger.debug(`event = ${typedEvent.toString()}`);
          await this.cartDao.deleteCart(typedEvent.aggregateId, new Date());
          this.logger.debug("deleted cart");
          break;
        }
        case CartItemAddedTypeSymbol: {
          const typedEvent = cartEvent as CartItemAdded;
          this.logger.debug(`event = ${typedEvent.toString()}`);
          await this.cartDao.insertCartItem(typedEvent.aggregateId, typedEvent.item, new Date());
          this.logger.debug("inserted cart item");
          break;
        }
        case CartItemRemovedTypeSymbol: {
          const typedEvent = cartEvent as CartItemRemoved;
          this.logger.debug(`event = ${typedEvent.toString()}`);
          await this.cartDao.deleteCartItem(typedEvent.item.id);
          this.logger.debug("deleted cart item");
          break;
        }
      }
    }
  }

  static of(cartDao: CartDao): ReadModelUpdater {
    return new ReadModelUpdater(cartDao);
  }
}

export { ReadModelUpdater };
