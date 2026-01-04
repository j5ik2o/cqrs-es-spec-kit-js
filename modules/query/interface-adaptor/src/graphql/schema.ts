import type { GraphQLSchema } from "graphql/type";
import { buildSchema } from "type-graphql";
import { CartQueryResolver } from "./resolvers";

async function createQuerySchema(): Promise<GraphQLSchema> {
  return await buildSchema({
    resolvers: [CartQueryResolver],
    validate: false,
  });
}

export { createQuerySchema };
