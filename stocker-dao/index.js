require("dotenv").config({
  path: "config.env",
});

const PORT = process.env.PORT || 3005;
// const channelId = "965495842557546526";

const express = require("express");
const chalk = require("chalk");
const http = require("http");
require("./discord.bot");

//==== express
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    result: "stocker",
  });
});

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(chalk.blueBright("==== stocker verify bot live ====>", PORT));
});
