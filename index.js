import { handler } from "./graphQL/handler";
import { setupFaunaDBSchema } from "./setup/setupFauna";
const graphql = handler;
const setupFaunaDB = setupFaunaDBSchema;

export { graphql, setupFaunaDB };
