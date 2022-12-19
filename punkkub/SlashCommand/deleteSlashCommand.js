require("dotenv").config({ path: "./config.env" });
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [
  new SlashCommandBuilder()
    .setName("gupunk")
    .setDescription("ถ้ามี punkkub ในกระเป๋าก็ลุยได้เลย !")
    .addStringOption((option) =>
      option
        .setName("wallet")
        .setDescription("เลขกระเป๋าที่มี punkkub อยู่ในนั้น !")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("reverify")
    .setDescription(
      "เพื่อนๆ สามารถ reverify กระเป๋า (เปลี่ยนกระเป๋า) ด้วยคำสั่งนี้"
    )
    .addStringOption((option) =>
      option
        .setName("oldwallet")
        .setDescription("กระเป๋าเดิมที่มา verify ไว้")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("newwallet")
        .setDescription("กระเป๋าใหม่ที่เปลี่ยน")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: 9 }).setToken(process.env.punkkubBotToken);

rest
  .put(
    Routes.applicationGuildCommands(process.env.clientId, process.env.guildId),
    { body: [] }
  )
  .then(() => console.log("Successfully deleted all guild commands."))
  .catch(console.error);
