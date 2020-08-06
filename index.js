import { handler } from "./graphQL/handler";
import { setupFaunaDBSchema } from "./lib/faunadb";
const graphql = handler;
const setupFaunaDB = setupFaunaDBSchema;

export { graphql, setupFaunaDB };
