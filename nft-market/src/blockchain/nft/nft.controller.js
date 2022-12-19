const { ethers } = require("ethers");
const { bkcJsonRpc } = require("../jsonRpc.provider");
const { nftAbi } = require("./abi");
const axios = require("axios");
const { getNFTAddressByName } = require("../../database/database.service");

async function getNftInfo(nftAddress, tokenId, price) {
  const nftContract = new ethers.Contract(nftAddress, nftAbi, bkcJsonRpc);
  const name = await nftContract.name();
  const symbol = await nftContract.symbol();
  const tokenUri = await nftContract.tokenURI(tokenId);
  const tokenData = await axios.get(tokenUri);
  const available = await isAvailable(nftAddress, tokenData);
  const output = {
    name: tokenData.data.name,
    collectionName: name,
    symbol: symbol.toString(),
    tokenId,
    tokenUri: tokenUri.toString(),
    tokenImageUri: tokenData.data.image,
    price,
    attributes: tokenData.data.attributes,
    enabled: available,
  };
  return output;
}

//fixed only morning moon logky-logky
async function isAvailable(nftAddress, tokenData) {
  const SPEC = 120;
  const MorningMoonAddress = await getNFTAddressByName("morningmoon");
  if (MorningMoonAddress == nftAddress) {
    return tokenData.data.attributes[1]["value"] === SPEC ? true : false;
  } else {
    return true;
  }
}

module.exports = {
  getNftInfo,
  isAvailable,
};
