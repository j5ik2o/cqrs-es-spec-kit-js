import type { GraphQLSchema } from "graphql/type";
import { buildSchema } from "type-graphql";
import { CartCommandResolver } from "./resolvers";

async function createCommandSchema(): Promise<GraphQLSchema> {
  return await buildSchema({
    resolvers: [CartCommandResolver],
    validate: false,
  });
}

export { createCommandSchema };
