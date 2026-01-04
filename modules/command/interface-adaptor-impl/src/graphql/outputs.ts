import { Field, ObjectType } from "type-graphql";

@ObjectType()
class CartOutput {
  @Field()
  cartId!: string;
}

@ObjectType()
class CartItemOutput {
  @Field()
  cartId!: string;

  @Field()
  itemId!: string;
}

@ObjectType()
class HealthCheckOutput {
  @Field()
  value!: string;
}

export { CartOutput, CartItemOutput, HealthCheckOutput };
