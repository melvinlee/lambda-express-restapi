const express = require("express");
const routes = express();
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const uuid = require("uuid");

const router = express.Router();

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: process.env.DYNAMODB_TABLE
};

router
  .route("/todos")
  .get(function list(req, res) {
    res.send("list");
  })
  .post(function create(req, res) {
    const timestamp = new Date().getTime();
    const { text } = req.body;

    if (typeof text !== "string") {
      res.status(400).send({ error: "Couldn't create todo item." });
    }

    const Item = {
      id: uuid.v1(),
      text: text,
      checked: false,
      createAt: timestamp,
      updateAt: timestamp
    };

    const createParam = Object.assign({}, params, { Item: Item });

    dynamoDb.put(createParam, err => {
      if (err) {
        console.error(err);
        res.status(400).send("Couldn't create todo item.");
      }
    });
    res.send(createParam);
  });

router
  .route("/todos/:id")
  .get(function get(req, res) {
    res.send("get");
  })
  .put(function update(req, res) {
    res.send("update");
  })
  .delete((req, res) => {
    res.end("delete");
  });

routes.use(bodyParser.json({ strict: false }));
routes.use(router);

module.exports = routes;
