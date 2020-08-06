import { query as q } from "faunadb";

function createFunction(faunaClient) {
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
                country: q.Select("country", q.Var("input"), "international"),
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
              q.Ref(q.Collection("Post"), q.Select("postId", q.Var("input"))),
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
              q.Ref(q.Collection("Post"), q.Select("postId", q.Var("input"))),
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
              q.Ref(q.Collection("Post"), q.Select("postId", q.Var("input"))),
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
              q.Ref(q.Collection("Post"), q.Select("postId", q.Var("input")))
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
                q.Ref(q.Collection("User"), q.Select("userId", q.Var("input")))
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
}

export default createFunction;
