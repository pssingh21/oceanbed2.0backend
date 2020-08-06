import { query as q } from "faunadb";
import CONSTANTS from "../../utils/constants";

function createCollection(faunaClient) {
  return faunaClient.query(
    q.Do(
      q.CreateCollection({ name: CONSTANTS.COLLECTIONS.USER }),
      q.CreateCollection({ name: CONSTANTS.COLLECTIONS.POST }),
      q.CreateCollection({ name: CONSTANTS.COLLECTIONS.FEEDBACK })
    )
  );
}

export default createCollection;
