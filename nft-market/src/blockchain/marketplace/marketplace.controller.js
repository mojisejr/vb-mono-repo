const { getFormattedPrice } = require("../../utils/priceFormatter");
const { ethers } = require("ethers");
const { getNftInfo } = require("../nft/nft.controller");
const {
  getChannelIdByAddress,
  getNFTByAddress,
} = require("../../database/database.service");

async function listingController(
  seller,
  nftContract,
  tokenId,
  price,
  createdAt,
  listingId,
  market
) {
  const { _, exchangeToken } = await market.idToListing(listingId.toString());
  const formattedPrice = getFormattedPrice(
    ethers.utils.formatEther(price.toString()).toString(),
    exchangeToken
  );
  const nftInfo = await getNftInfo(
    nftContract,
    tokenId.toString(),
    formattedPrice
  );
  const channelId = await getChannelIdByAddress(nftContract);
  return { ...nftInfo, seller, createdAt: createdAt.toString(), channelId };
}

async function sellingController(
  buyer,
  nftContract,
  tokenId,
  seller,
  soldAt,
  listingId,
  market
) {
  const { price, exchangeToken } = await market.idToListing(
    listingId.toString()
  );
  const formattedPrice = getFormattedPrice(
    ethers.utils.formatEther(price.toString()).toString(),
    exchangeToken
  );
  const nftInfo = await getNftInfo(
    nftContract,
    tokenId.toString(),
    formattedPrice
  );
  const channelId = await getChannelIdByAddress(nftContract);
  return {
    ...nftInfo,
    buyer,
    seller,
    soldAt: soldAt.toString(),
    channelId,
  };
}

module.exports = {
  listingController,
  sellingController,
};
