const AWS = require("aws-sdk");
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const tableParams = {
  TableName: process.env.DYNAMODB_TABLE
};

const listItem = (req, res) => {
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
};

const createItem = (req, res) => {
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
};

const getItem = (req, res) => {
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
};

const editItem = (req, res) => {
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
};

const deleteItem = (req, res) => {
  const params = Object.assign({}, tableParams, {
    Key: {
      id: req.params.id
    }
  });

  dynamoDb.delete(params, error => {
    if (error) {
      console.error(error);
      res.status(501).send({ error: "Could not delete toto item" });
    } else {
      res.status(204).send();
    }
  });
};

module.exports = { listItem, createItem, getItem, editItem, deleteItem };
