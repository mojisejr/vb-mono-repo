// require("dotenv").config({
//   path: "./config.env",
// });

// // const holder = require("./sqlite/models/holder.model");
// const { Sequelize, Model, DataTypes } = require("sequelize");
// const { ethers } = require("ethers");
// const { bot } = require("../discord.bot");
// const { giveRole, takeRole } = require("../discord.role");

// const { punkkub } = process.env;

// const sequelize2 = new Sequelize("whos-hodl", "non", "apollo2022team@-<A", {
//   host: "188.166.65.114",
//   port: 5432,
//   dialect: "postgres",
// });

// sequelize2.sync().then(() => console.log("PSQL: SYNCED"));

// class Holder extends Model {}

// Holder.init(
//   {
//     nftAddress: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     discordId: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     walletAddress: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     balance: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     //@NON: unixtimestamp
//     timestamp: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     verified: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//     },
//   },
//   { sequelize: sequelize2 }
// );

// const migrate = async () => {
//   const abi = ["function balanceOf(address _owner) view returns(uint256)"];
//   const provider = new ethers.providers.JsonRpcProvider(
//     "https://rpc.bitkubchain.io"
//   );
//   const contract = new ethers.Contract(punkkub, abi, provider);
//   const results = await holder.findAll();
//   const holders = results.map((r) => r.dataValues);
//   const mapped = await Promise.all(
//     holders.map(async (holder) => {
//       const balanceOf = parseInt(
//         (await contract.balanceOf(holder.id)).toString()
//       );
//       return {
//         nftAddress: punkkub,
//         walletAddress: holder.id,
//         balance: balanceOf,
//         verified: balanceOf <= 0 ? false : true,
//         discordId: holder.discordId,
//         timestamp: new Date().getTime(),
//       };
//     })
//   );

//   await Holder.bulkCreate(mapped).catch((e) =>
//     console.log("bulk creation failed, ", e)
//   );
// };

// async function updateRoles() {
//   const result = await Holder.findAll({
//     where: {
//       nftAddress: punkkub,
//       balance: 0,
//     },
//   });

//   const data = result.map((d) => d.dataValues);
//   data.forEach(async (d) => {
//     console.log("take roles : ", d.discordId);
//     await takeRole(bot, d.discordId);
//   });
// }

// // bot.on("ready", async () => {
// //   await updateRoles();
// // });
