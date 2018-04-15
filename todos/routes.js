const express = require("express");
const routes = express();
const bodyParser = require("body-parser");

const router = express.Router();

router
  .route("/todos")
  .get(function list(req, res) {
    res.send("list");
  })
  .post(function create(req, res) {
    res.send("create");
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
