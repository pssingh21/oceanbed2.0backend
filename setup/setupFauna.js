import faunadb, { query as q } from "faunadb";
import createCollection from "./Collections/createCollection";
import createIndex from "./Indexes/createIndex";
import createFunction from "./Functions/createFunction";
import createRole from "./Role/createRole";

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

export function setupFaunaDBSchema() {
  return createCollection(faunaClient)
    .then(() => {
      return createIndex(faunaClient)
        .then(() => {
          return createFunction(faunaClient);
        })
        .then(() => {
          return createRole(faunaClient);
        });
    })
    .catch((e) => console.log(e));
}
