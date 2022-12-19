const dotenv = require("dotenv");
const { ethers } = require("ethers");
const basePath = process.cwd();

dotenv.config({ path: `${basePath}/config.env` });

const bkcMainnetUrl = process.env.bkc_mainnet_url;
const bkcJsonRpc = new ethers.providers.JsonRpcProvider(bkcMainnetUrl);

module.exports = {
  bkcJsonRpc,
};
