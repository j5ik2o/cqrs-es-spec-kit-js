import { Field, ObjectType } from "type-graphql";

@ObjectType()
class OrderOutput {
  @Field()
  orderId!: string;
}

@ObjectType()
class OrderItemOutput {
  @Field()
  orderId!: string;

  @Field()
  itemId!: string;
}

@ObjectType()
class HealthCheckOutput {
  @Field()
  value!: string;
}

export { OrderOutput, OrderItemOutput, HealthCheckOutput };
