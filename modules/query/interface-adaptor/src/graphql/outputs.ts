import { Field, ObjectType } from "type-graphql";

@ObjectType()
class OrderQueryOutput {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  deleted!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
class OrderItemQueryOutput {
  @Field()
  id!: string;

  @Field()
  orderId!: string;

  @Field()
  name!: string;

  @Field()
  quantity!: number;

  @Field()
  price!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

export { OrderQueryOutput, OrderItemQueryOutput };
