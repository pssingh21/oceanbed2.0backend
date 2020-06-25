module.exports = function (client, q) {
  client
    .query(
      q.CreateCollection({
        name: "posts",
      })
    )
    .then(() => {
      return client.query(
        q.CreateIndex({
          name: "all_posts",
          source: q.Ref("classes/posts"),
        })
      );
    })
    .then(console.log.bind(console))
    .catch(console.error.bind(console));
};
