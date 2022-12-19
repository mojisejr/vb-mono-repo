require("dotenv").config({ path: "../../config.env" });
const { Client, Intents, MessageEmbed } = require("discord.js");

const intents = new Intents();

intents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES
);

const client = new Client({
  intents,
});

client.once("ready", async () => {
  console.log("discord market bot is ready");
});

client.login(process.env.bot_token);

async function sendListedToDiscord(data) {
  const {
    name,
    price,
    image,
    createdDate,
    createdTime,
    channelId,
    attributes,
  } = data;

  const embed = createPunkkubEmbedForListed(
    `${name} listed @${price}`,
    image,
    attributes
  );
  const channel = client.channels.cache.get(channelId);
  if (channel) {
    channel.send({
      embeds: [embed],
    });
  }
}

async function sendSoldToDiscord(data) {
  const { name, price, image, soldDate, soldTime, channelId, attributes } =
    data;
  const embed = createPunkkubEmbedForSold(
    `${name} Sold @${price}`,
    image,
    attributes
  );

  const channel = client.channels.cache.get(channelId);
  if (channel) {
    channel.send({
      embeds: [embed],
    });
  }
}

function createPunkkubEmbedForListed(title, uri, attributes) {
  const fields = tranformFieldData(attributes);
  // console.log("field: ", fields);
  const object = {
    color: 0x0099ff,
    title: title,
    image: {
      url: uri,
    },
    fields: fields,
    timestamp: new Date(),
    footer: {
      text: "💪 powered by [PunkKubNFT]",
    },
  };
  return object;
}

function createPunkkubEmbedForSold(title, uri, attributes) {
  const fields = tranformFieldData(attributes);
  // console.log("field: ", fields);
  const object = {
    color: 0xb20600,
    title: title,
    image: {
      url: uri,
    },
    fields: fields,
    timestamp: new Date(),
    footer: {
      text: "💪 powered by [PunkKubNFT]",
    },
  };
  return object;
}

function tranformFieldData(attributes = []) {
  let output = [];
  if (attributes.length <= 0) {
    return [];
  } else {
    output = attributes.map((attr) => {
      return {
        name: attr.trait_type.toString(),
        value: attr.value.toString() == "" ? "N/A" : attr.value.toString(),
        inline: true,
      };
    });
    return output;
  }
}

module.exports = {
  sendListedToDiscord,
  sendSoldToDiscord,
};
