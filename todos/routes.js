const AWS = require("aws-sdk");
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const tableParams = {
  TableName: process.env.DYNAMODB_TABLE
};

const listItem = async (req, res) => {
  try {
    let result = await dynamoDb.scan(tableParams).promise();
    res.send(result.Items);
  } catch (error) {
    console.error(error);
    res
      .statusCode(error.statusCode || 501)
      .send({ error: "Couldn't fetch the todos." });
  }
};

const createItem = async (req, res) => {
  const timestamp = new Date().getTime();
  const { text } = req.body;

  if (typeof text !== "string") {
    res.status(400).send({ error: "Couldn't create todo item." });
  }

  const item = {
    id: uuid.v1(),
    text: text,
    checked: false,
    createAt: timestamp,
    updateAt: timestamp
  };

  const params = Object.assign({}, tableParams, { Item: item });

  try {
    let result = await dynamoDb.put(params).promise();
    res.send(item);
  } catch (error) {
    console.error(error);
    res.status(400).send("Couldn't create todo item.");
  }
};

const getItem = async (req, res) => {
  const params = Object.assign({}, tableParams, {
    Key: {
      id: req.params.id
    }
  });

  try {
    let result = await dynamoDb.get(params).promise();

    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(400).send({ error: "Item not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Could not get todo item" });
  }
};

const editItem = async (req, res) => {
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

  try {
    let result = await dynamoDb.update(params).promise();
    res.send(result.Attributes);
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCoee || 501)
      .send({ error: "Could not update todo item" });
  }
};

const deleteItem = async (req, res) => {
  const params = Object.assign({}, tableParams, {
    Key: {
      id: req.params.id
    }
  });

  try {
    await dynamoDb.delete(params).promise();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(501).send({ error: "Could not delete toto item" });
  }
};

module.exports = { listItem, createItem, getItem, editItem, deleteItem };
