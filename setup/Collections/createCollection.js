import { query as q } from "faunadb";

function createCollection(faunaClient) {
  return faunaClient.query(
    q.Do(
      q.CreateCollection({ name: "User" }),
      q.CreateCollection({ name: "Post" }),
      q.CreateCollection({ name: "Feedback" })
    )
  );
}

export default createCollection;
