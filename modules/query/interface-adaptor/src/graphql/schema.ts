import type { GraphQLSchema } from "graphql/type";
import { buildSchema } from "type-graphql";
import { OrderQueryResolver } from "./resolvers";

async function createQuerySchema(): Promise<GraphQLSchema> {
  return await buildSchema({
    resolvers: [OrderQueryResolver],
    validate: false,
  });
}

export { createQuerySchema };
