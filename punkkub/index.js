require("dotenv").config({
  path: "config.env",
});
const sequelize = require("./database/postgres/database");

// require("dotenv").config({
//   path: "dev_config.env",
// });

const PORT = process.env.PORT || 1234;
// const channelId = "965495842557546526";

const ethers = require("ethers");
const express = require("express");
const chalk = require("chalk");
const http = require("http");
const axios = require("axios");
// 0x874987257374cAE9E620988FdbEEa2bBBf757cA9

// require("./game");

//==== express
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.get("/alive", (req, res) => {
  res.status(200).json({
    result: "punk!",
  });
});

//=== market bot
const { getFormattedPrice } = require("./helper/priceFormatter");

const {
  bot,
  createPunkkubEmbedForListed,
  createPunkkubEmbedForSold,
} = require("./discord.bot");

const BKCMainnetUrl = process.env.bitkubMainnet;
const BKCProvider = new ethers.providers.JsonRpcProvider(BKCMainnetUrl);

const megalandMarketPlace = new ethers.Contract(
  process.env.megalandMarketPlace,
  [
    "event ListingCreated(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 createdAt, uint256 listingId)",
    "event ItemSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 soldAt, uint256 listingId)",
    "function idToListing(uint256) view returns(uint256 listingId, address nftContract, uint256 tokenId, address exchangeToken, uint256 price, address seller, address buyer, uint256 createdAt, uint256 withdrawAt, uint256 soldAt, bool isKAP1155)",
  ],
  BKCProvider
);

const punkkub = new ethers.Contract(
  process.env.punkkub,
  [
    "function tokenURI(uint256 _tokenId) view returns(string memory)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  ],
  BKCProvider
);

megalandMarketPlace.on(
  "ListingCreated",
  async (seller, nftContract, tokenId, price, createdAt, listingId) => {
    if (nftContract === process.env.punkkub) {
      console.log(chalk.yellowBright("[MarketPlace]: token listed."));

      const { price, exchangeToken } = await megalandMarketPlace.idToListing(
        listingId.toString()
      );

      const object = {
        seller,
        nftContract,
        tokenId: tokenId.toString(),
        price: getFormattedPrice(
          ethers.utils.formatEther(price.toString()).toString(),
          exchangeToken
        ),
        createdDate: new Date(createdAt.toString() * 1000).toLocaleDateString(
          "th-TH"
        ),
        createdTime: new Date(
          parseInt(createdAt.toString()) * 1000
        ).toLocaleTimeString("th-TH"),
      };

      console.log("KPUNK Listing detail: ", object);
      await sendListedToDiscord(object, bot);
    }
  }
);

megalandMarketPlace.on(
  "ItemSold",
  async (buyer, nftContract, tokenId, seller, soldAt, listingId) => {
    if (nftContract === process.env.punkkub) {
      console.log(chalk.bgGreenBright("[MarketPlace]: token sold."));
      const { price, exchangeToken } = await megalandMarketPlace.idToListing(
        listingId.toString()
      );

      const object = {
        listingId: listingId.toString(),
        buyer,
        nftContract,
        tokenId: tokenId.toString(),
        price: getFormattedPrice(
          ethers.utils.formatEther(price.toString()).toString(),
          exchangeToken
        ),
        soldDate: new Date(
          parseInt(soldAt.toString()) * 1000
        ).toLocaleDateString("th-TH"),
        soldTime: new Date(
          parseInt(soldAt.toString()) * 1000
        ).toLocaleTimeString("th-TH"),
      };

      console.log("KPUNK selling detail: ", object);

      await sendSoldToDiscord(object, bot);
    }
  }
);

// run();
// startKeepAlive();

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(
    chalk.blueBright(
      "==== megaland - market tracker is now live ====",
      new Date().toDateString()
    )
  );
});

async function sendListedToDiscord(object, bot) {
  const tokenURI = await punkkub.tokenURI(object.tokenId);
  const jsonObj = await axios.get(tokenURI);

  const embed = createPunkkubEmbedForListed(
    `${jsonObj.data.name} listed @${object.price}`,
    jsonObj.data.image
  );
  const channel = bot.channels.cache.get(process.env.marketMonitorChannelId);
  if (channel) {
    channel.send({
      embeds: [embed],
    });
  }
}

async function sendSoldToDiscord(object, bot) {
  const tokenURI = await punkkub.tokenURI(object.tokenId);
  const jsonObj = await axios.get(tokenURI);

  const embed = createPunkkubEmbedForSold(
    `${jsonObj.data.name} Sold @${object.price}`,
    jsonObj.data.image
  );

  const channel = bot.channels.cache.get(process.env.marketMonitorChannelId);
  if (channel) {
    channel.send({
      embeds: [embed],
    });
  }
}

process.on("uncaughtException", (error) => {
  console.log("uncaughtException: ", error.message);
});
