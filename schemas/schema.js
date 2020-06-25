const faunadb = require("faunadb");
const usersSchema = require("./usersSchema");
const postsSchema = require("./postsSchema");
const feedbacksSchema = require("./feedbacksSchema");
require("dotenv").config();
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNADBSECRET,
});

usersSchema(client, q);

postsSchema(client, q);

feedbacksSchema(client, q);
