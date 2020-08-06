import faunadb, { query as q } from "faunadb";

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

export function setupFaunaDBSchema() {
  console.log("setupFaunaDBSchema");
  return faunaClient
    .query(
      q.Do(
        q.CreateCollection({ name: "User" }),
        q.CreateCollection({ name: "Post" }),
        q.CreateCollection({ name: "Feedback" })
      )
    )
    .then(() => {
      console.log("here");
      return faunaClient
        .query(
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
        )
        .then(() => {
          return faunaClient.query(
            q.Do(
              q.CreateFunction({
                name: "registerUser",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Create(q.Collection("User"), {
                      data: {
                        username: q.Select("username", q.Var("input")),
                        email: q.Select("email", q.Var("input")),
                        country: q.Select(
                          "country",
                          q.Var("input"),
                          "international"
                        ),
                        role: "USER",
                      },
                      credentials: {
                        password: q.Select("password", q.Var("input")),
                      },
                    })
                  )
                ),
              }),
              q.CreateFunction({
                name: "loginUser",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Select(
                      "secret",
                      q.Login(
                        q.Match(
                          q.Index("unique_User_username"),
                          q.Select("username", q.Var("input"), "international")
                        ),
                        {
                          password: q.Select("password", q.Var("input")),
                        }
                      )
                    )
                  )
                ),
              }),
              q.CreateFunction({
                name: "logoutUser",
                body: q.Query(q.Lambda([], q.Logout(false))),
              }),
              q.CreateFunction({
                name: "addPost",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Create(q.Collection("Post"), {
                      data: {
                        content: q.Select("content", q.Var("input")),
                        country: q.Select("country", q.Var("input")),
                        likes: 0,
                        report: false,
                        user: q.Select(
                          ["ref"],
                          q.Get(
                            q.Ref(
                              q.Collection("User"),
                              q.Select("userId", q.Var("input"))
                            )
                          )
                        ),
                      },
                    })
                  )
                ),
              }),
              q.CreateFunction({
                name: "addFeedback",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Create(q.Collection("Feedback"), {
                      data: {
                        content: q.Select("content", q.Var("input")),
                        user: q.Select(
                          ["ref"],
                          q.Get(
                            q.Ref(
                              q.Collection("User"),
                              q.Select("userId", q.Var("input"))
                            )
                          )
                        ),
                      },
                    })
                  )
                ),
              }),
              q.CreateFunction({
                name: "reportPost",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Update(
                      q.Ref(
                        q.Collection("Post"),
                        q.Select("postId", q.Var("input"))
                      ),
                      {
                        data: {
                          report: true,
                        },
                      }
                    )
                  )
                ),
              }),
              q.CreateFunction({
                name: "unreportPost",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Update(
                      q.Ref(
                        q.Collection("Post"),
                        q.Select("postId", q.Var("input"))
                      ),
                      {
                        data: {
                          report: false,
                        },
                      }
                    )
                  )
                ),
              }),
              q.CreateFunction({
                name: "addLikes",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Update(
                      q.Ref(
                        q.Collection("Post"),
                        q.Select("postId", q.Var("input"))
                      ),
                      {
                        data: {
                          likes: q.Select("likes", q.Var("input")),
                        },
                      }
                    )
                  )
                ),
              }),
              q.CreateFunction({
                name: "deletePost",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Delete(
                      q.Ref(
                        q.Collection("Post"),
                        q.Select("postId", q.Var("input"))
                      )
                    )
                  )
                ),
              }),
              q.CreateFunction({
                name: "deleteUser",
                body: q.Query(
                  q.Lambda(
                    ["input"],
                    q.Do(
                      q.Map(
                        q.Paginate(
                          q.Match(
                            q.Index("get_posts_by_user"),
                            q.Select(
                              ["ref"],
                              q.Get(
                                q.Ref(
                                  q.Collection("User"),
                                  q.Select("userId", q.Var("input"))
                                )
                              )
                            )
                          )
                        ),
                        q.Lambda(["postByUser"], q.Delete(q.Var("postByUser")))
                      ),
                      q.Delete(
                        q.Ref(
                          q.Collection("User"),
                          q.Select("userId", q.Var("input"))
                        )
                      )
                    )
                  )
                ),
              }),
              q.CreateFunction({
                name: "getPostsByUser",
                body: q.Query(
                  q.Lambda(
                    ["input", "size", "after", "before"],
                    q.Let(
                      {
                        match: q.Match(
                          q.Index("get_posts_by_user"),
                          q.Select(
                            ["ref"],
                            q.Get(
                              q.Ref(
                                q.Collection("User"),
                                q.Select("userId", q.Var("input"))
                              )
                            )
                          )
                        ),
                        page: q.If(
                          q.Equals(q.Var("before"), null),
                          q.If(
                            q.Equals(q.Var("after"), null),
                            q.Paginate(q.Var("match"), { size: q.Var("size") }),
                            q.Paginate(q.Var("match"), {
                              size: q.Var("size"),
                              after: q.Var("after"),
                            })
                          ),
                          q.Paginate(q.Var("match"), {
                            size: q.Var("size"),
                            before: q.Var("before"),
                          })
                        ),
                      },
                      q.Map(q.Var("page"), q.Lambda("ref", q.Get(q.Var("ref"))))
                    )
                  )
                ),
              }),
              q.CreateFunction({
                name: "getReportedPosts",
                body: q.Query(
                  q.Lambda(
                    ["size", "after", "before"],
                    q.Let(
                      {
                        match: q.Match(q.Index("get_reported_posts"), true),
                        page: q.If(
                          q.Equals(q.Var("before"), null),
                          q.If(
                            q.Equals(q.Var("after"), null),
                            q.Paginate(q.Var("match"), { size: q.Var("size") }),
                            q.Paginate(q.Var("match"), {
                              size: q.Var("size"),
                              after: q.Var("after"),
                            })
                          ),
                          q.Paginate(q.Var("match"), {
                            size: q.Var("size"),
                            before: q.Var("before"),
                          })
                        ),
                      },
                      q.Map(q.Var("page"), q.Lambda("ref", q.Get(q.Var("ref"))))
                    )
                  )
                ),
              }),
              q.CreateFunction({
                name: "getPostsByCountry",
                body: q.Query(
                  q.Lambda(
                    ["input", "size", "after", "before"],
                    q.Let(
                      {
                        match: q.Match(
                          q.Index("get_posts_by_country"),
                          q.Select("country", q.Var("input"))
                        ),
                        page: q.If(
                          q.Equals(q.Var("before"), null),
                          q.If(
                            q.Equals(q.Var("after"), null),
                            q.Paginate(q.Var("match"), { size: q.Var("size") }),
                            q.Paginate(q.Var("match"), {
                              size: q.Var("size"),
                              after: q.Var("after"),
                            })
                          ),
                          q.Paginate(q.Var("match"), {
                            size: q.Var("size"),
                            before: q.Var("before"),
                          })
                        ),
                      },
                      q.Map(q.Var("page"), q.Lambda("ref", q.Get(q.Var("ref"))))
                    )
                  )
                ),
              })
            )
          );
        })
        .then(() => {
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
                        q.Lambda(
                          ["userRef"],
                          q.Equals(q.Identity(), q.Var("userRef"))
                        )
                      ),
                    },
                  },
                  {
                    resource: q.Collection("Feedback"),
                    actions: {
                      create: q.Query((newData) =>
                        q.Equals(
                          q.Identity(),
                          q.Select(["data", "user"], newData)
                        )
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
                        q.Equals(
                          q.Identity(),
                          q.Select(["data", "user"], newData)
                        )
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
                        q.Lambda(
                          "terms",
                          q.Equals(q.Var("terms"), [q.Identity()])
                        )
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
        });
    })
    .catch((e) => console.log(e));
}
