const express = require("express");
const routes = express();
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const uuid = require("uuid");

const router = express.Router();

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const tableParams = {
  TableName: process.env.DYNAMODB_TABLE
};

router
  .route("/todos")
  .get(function list(req, res) {
    dynamoDb.scan(tableParams, (error, result) => {
      if (error) {
        console.error(error);
        res
          .statusCode(error.statusCode || 501)
          .send({ error: "Couldn't fetch the todos." });
      } else {
        res.send(result.Items);
      }
    });
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

    const params = Object.assign({}, tableParams, { Item: Item });

    dynamoDb.put(params, error => {
      if (error) {
        console.error(error);
        res.status(400).send("Couldn't create todo item.");
      } else {
        res.send(params);
      }
    });
  });

router
  .route("/todos/:id")
  .get(function get(req, res) {
    const params = Object.assign({}, tableParams, {
      Key: {
        id: req.params.id
      }
    });

    dynamoDb.get(params, (error, result) => {
      if (error) {
        console.error(error);
        res.status(400).send({ error: "Could not get todo item" });
      }

      if (result.Item) {
        res.json(result.Item);
      } else {
        res.status(400).send({ error: "Item not found" });
      }
    });
  })
  .put(function update(req, res) {
    const timestamp = new Date().getTime();
    const { text, checked } = req.body;

    // validation
    if (typeof text !== "string" || typeof checked !== "boolean") {
      console.error("Validation failed");
      res.status(400).send({ error: "Validation failed" });
    }

    const params = Object.assign({}, tableParams, {
      Key: {
        id: req.params.id
      },
      ExpressionAttributeNames: {
        "#todo_text": "text"
      },
      ExpressionAttributeValues: {
        ":text": text,
        ":checked": checked,
        ":updatedAt": timestamp
      },
      UpdateExpression:
        "SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt",
      ReturnValues: "ALL_NEW"
    });

    dynamoDb.update(params, (error, result) => {
      if (error) {
        console.error(error);
        res
          .status(error.statusCoee || 501)
          .send({ error: "Could not update todo item" });
      } else {
        res.send(result.Attributes);
      }
    });
  })
  .delete((req, res) => {
    res.end("delete");
  });

routes.use(bodyParser.json({ strict: false }));
routes.use(router);

module.exports = routes;
