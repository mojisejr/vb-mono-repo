const { Sequelize } = require("sequelize");
const basePath = process.cwd();

const sequelize = new Sequelize("game-state-db", "user", "pass", {
  dialect: "sqlite",
  host: "./database/sqlite/state.sqlite",
  logging: true,
});

module.exports = sequelize;
