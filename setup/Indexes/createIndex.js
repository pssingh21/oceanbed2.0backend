import { query as q } from "faunadb";
import CONSTANTS from "../../utils/constants";

function createIndex(faunaClient) {
  return faunaClient.query(
    q.Do(
      q.CreateIndex({
        name: CONSTANTS.INDEXES.GET_ALL_USERS,
        source: q.Collection(CONSTANTS.COLLECTIONS.USER),
      }),
      q.CreateIndex({
        name: CONSTANTS.INDEXES.GET_ALL_POSTS,
        source: q.Collection(CONSTANTS.COLLECTIONS.POST),
      }),
      q.CreateIndex({
        name: CONSTANTS.INDEXES.GET_POSTS_BY_USER,
        source: q.Collection(CONSTANTS.COLLECTIONS.POST),
        terms: [
          {
            field: ["data", "user"],
          },
        ],
      }),
      q.CreateIndex({
        name: CONSTANTS.INDEXES.GET_REPORTED_POSTS,
        source: q.Collection(CONSTANTS.COLLECTIONS.POST),
        terms: [
          {
            field: ["data", "report"],
          },
        ],
      }),
      q.CreateIndex({
        name: CONSTANTS.INDEXES.GET_POSTS_BY_COUNTRY,
        source: q.Collection(CONSTANTS.COLLECTIONS.POST),
        terms: [
          {
            field: ["data", "country"],
          },
        ],
      }),
      q.CreateIndex({
        name: CONSTANTS.INDEXES.GET_ALL_FEEDBACKS,
        source: q.Collection(CONSTANTS.COLLECTIONS.FEEDBACK),
      })
    )
  );
}

export default createIndex;
