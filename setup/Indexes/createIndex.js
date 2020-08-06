import { query as q } from "faunadb";

function createIndex(faunaClient) {
  return faunaClient.query(
    q.Do(
      q.CreateIndex({
        name: "get_all_users",
        source: q.Collection("User"),
      }),
      q.CreateIndex({
        name: "get_all_posts",
        source: q.Collection("Post"),
      }),
      q.CreateIndex({
        name: "get_posts_by_user",
        source: q.Collection("Post"),
        terms: [
          {
            field: ["data", "user"],
          },
        ],
      }),
      q.CreateIndex({
        name: "get_reported_posts",
        source: q.Collection("Post"),
        terms: [
          {
            field: ["data", "report"],
          },
        ],
      }),
      q.CreateIndex({
        name: "get_posts_by_country",
        source: q.Collection("Post"),
        terms: [
          {
            field: ["data", "country"],
          },
        ],
      }),
      q.CreateIndex({
        name: "get_all_feedbacks",
        source: q.Collection("Feedback"),
      })
    )
  );
}

export default createIndex;
