import Responses from "../utils/API_Responses";
const fetch = require("node-fetch");

export function handler(event, _context, callback) {
  const query = JSON.parse(event.body).query;
  const authorization = getBearerToken(event.headers);

  runGraphQL(query, authorization)
    .then((data) => {
      callback(null, Responses._200(data));
    })
    .catch((err) => {
      callback(null, Responses._400(err.response));
    });
}

async function runGraphQL(query, authorization) {
  const endpoint = process.env.FAUNADB_ENDPOINT;

  return await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
    },
    body: JSON.stringify({ query: query }),
  }).then((response) => response.json());
}

function getBearerToken(headers) {
  if (headers.Authorization) {
    if (headers.Authorization.split(" ")[0] === "Bearer") {
      return headers.Authorization;
    }
  }
  return "Basic " + process.env.FAUNDB_TEMP_USER;
}
