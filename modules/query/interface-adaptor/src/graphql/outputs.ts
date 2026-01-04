import { Field, ObjectType } from "type-graphql";

@ObjectType()
class CartQueryOutput {
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
class CartItemQueryOutput {
  @Field()
  id!: string;

  @Field()
  cartId!: string;

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

export { CartQueryOutput, CartItemQueryOutput };
