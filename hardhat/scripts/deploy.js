
const hre = require("hardhat");
const { CYPRTO_DEVS_NFT_CONTRACT } = require("../constants");

require("dotenv").config()

async function main() {

  const CryptoDevsToken = await hre.ethers.getContractFactory("CryptoDevToken");
  const cryptodevstoken = await CryptoDevsToken.deploy(`${CYPRTO_DEVS_NFT_CONTRACT}`)
  await cryptodevstoken.deployed()

  console.log(
    `CryptoDevsToken deployed at  ${cryptodevstoken.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
