const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
require("./blockchain/marketplace");
require("./discord");
const { addNewNft } = require("./database/database.service");

dotenv.config({
  path: "../config.env",
});

const port = process.env.PORT || 3004;

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    result: "OK",
  });
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log("server created at port", port);
});
