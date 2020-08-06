import { query as q } from "faunadb";
import CONSTANTS from "../../utils/constants";

function createFunction(faunaClient) {
  return faunaClient.query(
    q.Do(
      q.CreateFunction({
        name: CONSTANTS.FUNCTIONS.REGISTER_USER,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Create(q.Collection(CONSTANTS.COLLECTIONS.USER), {
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
        name: CONSTANTS.FUNCTIONS.LOGIN_USER,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Select(
              "secret",
              q.Login(
                q.Match(
                  q.Index(CONSTANTS.INDEXES.UNIQUE_USER_USERNAME),
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
        name: CONSTANTS.FUNCTIONS.LOGOUT_USER,
        body: q.Query(q.Lambda([], q.Logout(false))),
      }),
      q.CreateFunction({
        name: CONSTANTS.FUNCTIONS.ADD_POST,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Create(q.Collection(CONSTANTS.COLLECTIONS.POST), {
              data: {
                content: q.Select("content", q.Var("input")),
                country: q.Select("country", q.Var("input")),
                likes: 0,
                report: false,
                user: q.Select(
                  ["ref"],
                  q.Get(
                    q.Ref(
                      q.Collection(CONSTANTS.COLLECTIONS.USER),
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
        name: CONSTANTS.FUNCTIONS.ADD_FEEDBACK,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Create(q.Collection(CONSTANTS.COLLECTIONS.FEEDBACK), {
              data: {
                content: q.Select("content", q.Var("input")),
                user: q.Select(
                  ["ref"],
                  q.Get(
                    q.Ref(
                      q.Collection(CONSTANTS.COLLECTIONS.USER),
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
        name: CONSTANTS.FUNCTIONS.REPORT_POST,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Update(
              q.Ref(
                q.Collection(CONSTANTS.COLLECTIONS.POST),
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
        name: CONSTANTS.FUNCTIONS.UNREPORT_POST,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Update(
              q.Ref(
                q.Collection(CONSTANTS.COLLECTIONS.POST),
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
        name: CONSTANTS.FUNCTIONS.ADD_LIKES,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Update(
              q.Ref(
                q.Collection(CONSTANTS.COLLECTIONS.POST),
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
        name: CONSTANTS.FUNCTIONS.DELETE_POST,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Delete(
              q.Ref(
                q.Collection(CONSTANTS.COLLECTIONS.POST),
                q.Select("postId", q.Var("input"))
              )
            )
          )
        ),
      }),
      q.CreateFunction({
        name: CONSTANTS.FUNCTIONS.DELETE_USER,
        body: q.Query(
          q.Lambda(
            ["input"],
            q.Do(
              q.Map(
                q.Paginate(
                  q.Match(
                    q.Index(CONSTANTS.INDEXES.GET_POSTS_BY_USER),
                    q.Select(
                      ["ref"],
                      q.Get(
                        q.Ref(
                          q.Collection(CONSTANTS.COLLECTIONS.USER),
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
                  q.Collection(CONSTANTS.COLLECTIONS.USER),
                  q.Select("userId", q.Var("input"))
                )
              )
            )
          )
        ),
      }),
      q.CreateFunction({
        name: CONSTANTS.FUNCTIONS.GET_POSTS_BY_USER,
        body: q.Query(
          q.Lambda(
            ["input", "size", "after", "before"],
            q.Let(
              {
                match: q.Match(
                  q.Index(CONSTANTS.INDEXES.GET_POSTS_BY_USER),
                  q.Select(
                    ["ref"],
                    q.Get(
                      q.Ref(
                        q.Collection(CONSTANTS.COLLECTIONS.USER),
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
        name: CONSTANTS.FUNCTIONS.GET_REPORTED_POSTS,
        body: q.Query(
          q.Lambda(
            ["size", "after", "before"],
            q.Let(
              {
                match: q.Match(
                  q.Index(CONSTANTS.INDEXES.GET_REPORTED_POSTS),
                  true
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
        name: CONSTANTS.FUNCTIONS.GET_POSTS_BY_COUNTRY,
        body: q.Query(
          q.Lambda(
            ["input", "size", "after", "before"],
            q.Let(
              {
                match: q.Match(
                  q.Index(CONSTANTS.INDEXES.GET_POSTS_BY_COUNTRY),
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
