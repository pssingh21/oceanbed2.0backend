module.exports = function (client, q) {
  client
    .query(
      q.CreateCollection({
        name: "feedbacks",
      })
    )
    .then(() => {
      return client.query(
        q.CreateIndex({
          name: "all_feedbacks",
          source: q.Ref("classes/feedbacks"),
        })
      );
    })
    .then(console.log.bind(console))
    .catch(console.error.bind(console));
};
