import { query as q } from "faunadb";

function createRole(faunaClient) {
  return faunaClient.query(
    q.Do(
      q.CreateRole({
        name: "USER",
        membership: {
          resource: q.Collection("User"),
          predicate: q.Query(
            q.Lambda(
              ["userRef"],
              q.Equals(
                q.Select(["data", "role"], q.Get(q.Var("userRef"))),
                "USER"
              )
            )
          ),
        },
        privileges: [
          {
            resource: q.Collection("User"),
            actions: {
              create: true,
              read: true,
              delete: q.Query(
                q.Lambda(["userRef"], q.Equals(q.Identity(), q.Var("userRef")))
              ),
            },
          },
          {
            resource: q.Collection("Feedback"),
            actions: {
              create: q.Query((newData) =>
                q.Equals(q.Identity(), q.Select(["data", "user"], newData))
              ),
              read: false,
              delete: false,
              write: false,
            },
          },
          {
            resource: q.Collection("Post"),
            actions: {
              create: q.Query((newData) =>
                q.Equals(q.Identity(), q.Select(["data", "user"], newData))
              ),
              read: true,
              delete: q.Query(
                q.Lambda(
                  ["postRef"],
                  q.Equals(
                    q.Identity(),
                    q.Select(["data", "user"], q.Get(q.Var("postRef")))
                  )
                )
              ),
              write: true,
            },
          },
          {
            resource: q.Index("get_all_users"),
            actions: {
              read: false,
            },
          },
          {
            resource: q.Index("get_all_posts"),
            actions: {
              read: true,
            },
          },
          {
            resource: q.Index("get_reported_posts"),
            actions: {
              read: false,
            },
          },
          {
            resource: q.Index("get_posts_by_country"),
            actions: {
              read: true,
            },
          },
          {
            resource: q.Index("get_posts_by_user"),
            actions: {
              read: q.Query(
                q.Lambda("terms", q.Equals(q.Var("terms"), [q.Identity()]))
              ),
            },
          },
          {
            resource: q.Function("addPost"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("getPostsByCountry"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("reportPost"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("addLikes"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("addFeedback"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("deletePost"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("deleteUser"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("getPostsByUser"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("registerUser"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("loginUser"),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function("logoutUser"),
            actions: {
              call: true,
            },
          },
        ],
      })
    )
  );
}

export default createRole;
