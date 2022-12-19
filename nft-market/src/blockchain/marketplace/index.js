const dotenv = require("dotenv");
dotenv.config({ path: "../../config.env" });

const chalk = require("chalk");
const sell = chalk.bgGreenBright.bold;
const error = chalk.redBright;
const { ethers } = require("ethers");
const { bkcJsonRpc } = require("../jsonRpc.provider");
const { marketAbi, marketAddress } = require("./abi");
const { MarketEvent } = require("../../models/marketplace.event.model");
const {
  listingController,
  sellingController,
} = require("./marketplace.controller");
const { sendListedToDiscord, sendSoldToDiscord } = require("../../discord");
const { getNFTByAddress } = require("../../database/database.service");

const megaland = new ethers.Contract(marketAddress, marketAbi, bkcJsonRpc);
megaland.on(
  MarketEvent.Listing,
  async (seller, nftContract, tokenId, price, createdAt, listingId) => {
    try {
      const targetContract = await getNFTByAddress(nftContract);
      if (targetContract !== null) {
        const nftInfo = await listingController(
          seller,
          nftContract,
          tokenId,
          price,
          createdAt,
          listingId,
          megaland
        );
        if (nftInfo.enabled) {
          await sendListedToDiscord({
            name: nftInfo.name,
            price: nftInfo.price,
            image: nftInfo.tokenImageUri,
            createdDate: nftInfo.createdAt,
            createdTime: "",
            channelId: nftInfo.channelId,
            attributes: nftInfo.attributes,
          });
        }
        console.log("listing: ", nftInfo.name);
      }
    } catch (e) {
      console.log(error(`error on listing !: ${e.message}`));
    }
  }
);
megaland.on(
  MarketEvent.Selling,
  async (buyer, nftContract, tokenId, seller, soldAt, listingId) => {
    try {
      const targetContract = await getNFTByAddress(nftContract);
      if (targetContract !== null) {
        const nftInfo = await sellingController(
          buyer,
          nftContract,
          tokenId,
          seller,
          soldAt,
          listingId,
          megaland
        );
        if (nftInfo.enabled) {
          await sendSoldToDiscord({
            name: nftInfo.name,
            price: nftInfo.price,
            image: nftInfo.tokenImageUri,
            soldDate: nftInfo.soldAt,
            soldTime: "",
            channelId: nftInfo.channelId,
            attributes: nftInfo.attributes,
          });
        }
        console.log(sell(`sold: ${nftInfo.name} | price: ${nftInfo.price}`));
      }
    } catch (e) {
      console.log(error(`error on sold: ${e.message}`));
    }
  }
);
