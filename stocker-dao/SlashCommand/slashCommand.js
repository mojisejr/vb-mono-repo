require("dotenv").config({ path: "./config.env" });
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [
  new SlashCommandBuilder()
    .setName("stocker")
    .setDescription(
      "verify StockerDAO holder! [powered by non | KPUNK] : need to have stocker dao nft inside your wallet"
    )
    .addStringOption((option) =>
      option
        .setName("wallet")
        .setDescription("wallet address the have Stocker DAO nft inside.")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: 9 }).setToken(process.env.punkkubBotToken);

rest
  .put(
    Routes.applicationGuildCommands(process.env.clientId, process.env.guildId),
    { body: commands }
  )
  .then(() => console.log("OK! lets get punk it!"))
  .catch(console.error);
