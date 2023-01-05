require("dotenv").config({ path: "./config.env" });
const { Sequelize } = require("sequelize");
const { production, postgres_db, postgres_user, postgres_pwd, postgres_port } =
  process.env;

// const sequelize = new Sequelize(
//   production == "PROD" ? postgres_db : postgres_db,
//   postgres_user,
//   postgres_pwd,
//   {
//     host: production == "PROD" ? "host.docker.internal" : "188.166.65.114",
//     port: postgres_port,
//     dialect: "postgres",
//     logging: false,
//   }
// );

const sequelize = new Sequelize("whos-hodl", "non", "apollo2022team@-<A", {
  host: "188.166.65.114",
  dialect: "postgres",
  port: 5432,
});

// sequelize.authenticate().then(console.log("PSQL: authenticated!"));
sequelize.sync().then(console.log("PSQL: synced!!"));

module.exports = sequelize;
