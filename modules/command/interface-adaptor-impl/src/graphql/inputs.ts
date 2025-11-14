import { Field, InputType } from "type-graphql";

@InputType()
class CreateOrderInput {
  @Field()
  name!: string;

  @Field()
  executorId!: string;
}

@InputType()
class AddItemInput {
  @Field()
  orderId!: string;

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
class RemoveItemInput {
  @Field()
  orderId!: string;

  @Field()
  itemId!: string;

  @Field()
  executorId!: string;
}

@InputType()
class DeleteOrderInput {
  @Field()
  orderId!: string;

  @Field()
  executorId!: string;
}

export { CreateOrderInput, AddItemInput, RemoveItemInput, DeleteOrderInput };
