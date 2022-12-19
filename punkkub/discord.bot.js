const { Client, Intents, MessageEmbed } = require("discord.js");

const { checkVerifyHolder, reverifyHolder } = require("./discord.verify");
const { VERIFY, REVERIFY } = require("./constants/commands");

const intents = new Intents();

intents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS
);

const client = new Client({
  intents,
});

const ethers = require("ethers");
const BKCMainnetUrl = process.env.bitkubMainnet;
const BKCProvider = new ethers.providers.JsonRpcProvider(BKCMainnetUrl);
const { giveRole, takeRole } = require("./discord.role");
const { getHolderBalance } = require("./discord.verify");
const {
  getDataByWallet,
  updateVerificationStatus,
} = require("./csv/verify.service");

const punkkub = new ethers.Contract(
  process.env.punkkub,
  [
    "function tokenURI(uint256 _tokenId) view returns(string memory)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  ],
  BKCProvider
);

client.once("ready", async () => {
  console.log("punkkub-discord is ready");
});

client.login(process.env.punkkubBotToken);

//reverification
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isCommand() && interaction.commandName == REVERIFY) {
      const inputData = {
        oldWallet: interaction.options.data[0].value,
        newWallet: interaction.options.data[1].value,
        discordId: interaction.user.id,
        discordName: interaction.user.tag,
        timestamp: Date.now(),
      };

      await reverifyHolder(inputData, client, interaction);
      return;
    }
  } catch (e) {
    console.log(e);
    await interaction.deferReply();
    await interaction.editReply("🤯 มีบางอย่างผิดปกติมากๆ ติดต่อ non | KPUNK!");
    return;
  }
});

//verification
client.on("interactionCreate", async (interaction) => {
  //format data
  try {
    if (interaction.isCommand() && interaction.commandName == VERIFY) {
      const inputData = {
        wallet: interaction.options.data[0].value,
        discordId: interaction.user.id,
        discordName: interaction.user.tag,
        timestamp: Date.now(),
      };

      //verify check
      await checkVerifyHolder(inputData, client, interaction);
      return;
    }
  } catch (e) {
    console.log(e);
    await interaction.deferReply();
    await interaction.editReply("🤯 มีบางอย่างผิดปกติมากๆ ติดต่อ non | KPUNK!");
    return;
  }
});

process.on("uncaughtException", (error) => {
  console.log(error);
});

//tracking transfer event for give discord user a role and nickname
punkkub.on("Transfer", async (from, to, tokenId) => {
  if (isMarketPlace(to)) {
    await onTransferUpdateRole(from);
  } else if (isMarketPlace(from)) {
    await onTransferUpdateRole(to);
  } else {
    await onTransferUpdateRole(to);
    await onTransferUpdateRole(from);
  }
});

async function onTransferUpdateRole(wallet) {
  const holderData = await getDataByWallet(wallet);
  const balance = await getHolderBalance(wallet);
  if (balance > 0 && holderData && holderData.wallet == wallet) {
    console.log(`@${wallet} : is holder.`);
    await giveRole(client, holderData.discordId);
    await updateVerificationStatus(wallet, balance, true);
  } else if (balance <= 0 && holderData && holderData.wallet == wallet) {
    console.log(`@${wallet} : is NOT holder`);
    await takeRole(client, holderData.discordId);
    await updateVerificationStatus(wallet, balance, false);
  } else {
    console.log(`transfer from non-verified holder. @${wallet}`);
  }
}

//check if receiver is marketplace
function isMarketPlace(to) {
  let marketPlaceAddress = "0x874987257374cAE9E620988FdbEEa2bBBf757cA9";
  let middleAddress = "0xA51b0F76f0d7d558DFc0951CFD74BB85a70E2a95";

  if (to === marketPlaceAddress || to === middleAddress) {
    return true;
  } else {
    return false;
  }
}

function createPunkkubEmbedForListed(title, uri) {
  const embed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(title)
    .setImage(uri)
    .setTimestamp(new Date());
  return embed;
}

function createPunkkubEmbedForSold(title, uri) {
  const embed = new MessageEmbed()
    .setColor("#B20600")
    .setTitle(title)
    .setImage(uri)
    .setTimestamp(new Date());
  return embed;
}

module.exports = {
  bot: client,
  createPunkkubEmbedForListed: createPunkkubEmbedForListed,
  createPunkkubEmbedForSold: createPunkkubEmbedForSold,
};
