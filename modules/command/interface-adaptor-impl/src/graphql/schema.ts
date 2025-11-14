import type { GraphQLSchema } from "graphql/type";
import { buildSchema } from "type-graphql";
import { OrderCommandResolver } from "./resolvers";

async function createCommandSchema(): Promise<GraphQLSchema> {
  return await buildSchema({
    resolvers: [OrderCommandResolver],
    validate: false,
  });
}

export { createCommandSchema };
