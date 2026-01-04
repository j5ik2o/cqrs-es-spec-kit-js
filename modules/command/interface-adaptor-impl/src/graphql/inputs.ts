import { Field, InputType } from "type-graphql";

@InputType()
class CreateCartInput {
  @Field()
  name!: string;

  @Field()
  executorId!: string;
}

@InputType()
class AddItemToCartInput {
  @Field()
  cartId!: string;

  @Field()
  name!: string;

  @Field()
  quantity!: number;

  @Field()
  price!: number;

  @Field()
  executorId!: string;
}

@InputType()
class RemoveItemFromCartInput {
  @Field()
  cartId!: string;

  @Field()
  itemId!: string;

  @Field()
  executorId!: string;
}

@InputType()
class DeleteCartInput {
  @Field()
  cartId!: string;

  @Field()
  executorId!: string;
}

export { CreateCartInput, AddItemToCartInput, RemoveItemFromCartInput, DeleteCartInput };
