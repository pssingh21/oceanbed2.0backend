const Responses = require("./API_Responses");

exports.handler = async (event) => {
  console.log("event", event);

  if (!event.pathParameters || !event.pathParameters.ID) {
    //failed without an ID
    return Responses._400({ message: "Missing ID in path" });
  }

  let ID = event.pathParameters.ID;

  if (data[ID]) {
    //return data
    return Responses._200(data[ID]);
  }

  //failed as ID not in data
  return Responses._400({ message: "No ID in data" });
};

const data = {
  1234: { name: "Anna Jones", age: 25, job: "journalist" },
  7893: { name: "Chris Smith", age: 52, job: "teacher" },
  5132: { name: "Tom Hague", age: 23, job: "plasterer" },
};
