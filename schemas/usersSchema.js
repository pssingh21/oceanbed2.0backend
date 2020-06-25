module.exports = function (client, q) {
  client
    .query(
      q.CreateCollection({
        name: "users",
      })
    )
    .then(() => {
      return client.query(
        q.CreateIndex({
          name: "all_users",
          source: q.Ref("classes/users"),
        })
      );
    })
    .then(console.log.bind(console))
    .catch(console.error.bind(console));
};
