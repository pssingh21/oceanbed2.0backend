import { query as q } from "faunadb";
import CONSTANTS from "../../utils/constants";

function createRole(faunaClient) {
  return faunaClient.query(
    q.Do(
      q.CreateRole({
        name: CONSTANTS.ROLE.USER,
        membership: {
          resource: q.Collection(CONSTANTS.COLLECTIONS.USER),
          predicate: q.Query(
            q.Lambda(
              ["userRef"],
              q.Equals(
                q.Select(["data", "role"], q.Get(q.Var("userRef"))),
                CONSTANTS.ROLE.USER
              )
            )
          ),
        },
        privileges: [
          {
            resource: q.Collection(CONSTANTS.COLLECTIONS.USER),
            actions: {
              create: true,
              read: true,
              delete: q.Query(
                q.Lambda(["userRef"], q.Equals(q.Identity(), q.Var("userRef")))
              ),
            },
          },
          {
            resource: q.Collection(CONSTANTS.COLLECTIONS.FEEDBACK),
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
            resource: q.Collection(CONSTANTS.COLLECTIONS.POST),
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
            resource: q.Index(CONSTANTS.INDEXES.GET_ALL_USERS),
            actions: {
              read: false,
            },
          },
          {
            resource: q.Index(CONSTANTS.INDEXES.GET_ALL_POSTS),
            actions: {
              read: true,
            },
          },
          {
            resource: q.Index(CONSTANTS.INDEXES.GET_REPORTED_POSTS),
            actions: {
              read: false,
            },
          },
          {
            resource: q.Index(CONSTANTS.INDEXES.GET_POSTS_BY_COUNTRY),
            actions: {
              read: true,
            },
          },
          {
            resource: q.Index(CONSTANTS.INDEXES.GET_POSTS_BY_USER),
            actions: {
              read: q.Query(
                q.Lambda("terms", q.Equals(q.Var("terms"), [q.Identity()]))
              ),
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.ADD_POST),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.GET_POSTS_BY_COUNTRY),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.REPORT_POST),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.ADD_LIKES),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.ADD_FEEDBACK),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.DELETE_POST),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.DELETE_USER),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.GET_POSTS_BY_USER),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.REGISTER_USER),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.LOGIN_USER),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function(CONSTANTS.FUNCTIONS.LOGOUT_USER),
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
