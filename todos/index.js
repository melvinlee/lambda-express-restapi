const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

app.use(bodyParser.json({ strict: false }));

app.get("/", (req, res) => {
  res.json({ message: "Todo API" });
});

app
  .route("/todos")
  .get(routes.listItem)
  .post(routes.createItem);

app
  .route("/todos/:id")
  .get(routes.getItem)
  .put(routes.editItem)
  .delete(routes.deleteItem);

module.exports.handler = serverless(app);
