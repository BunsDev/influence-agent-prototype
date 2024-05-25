import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deploy-contracts'");

  const network = hre.network.name;

  if (
    !CONTRACTS[network].offerToken &&
    CONTRACTS[network].functionsDonId &&
    CONTRACTS[network].functionsRouter &&
    CONTRACTS[network].functionsSubscriptionId
  ) {
    const contractFactory = await ethers.getContractFactory("OfferToken");
    const contract = await contractFactory.deploy(
      CONTRACTS[network].functionsDonId as `0x${string}`,
      CONTRACTS[network].functionsRouter as `0x${string}`,
      CONTRACTS[network].functionsSubscriptionId as number
    );
    await contract.waitForDeployment();
    console.log(
      `Contract 'OfferToken' deployed to: ${await contract.getAddress()}`
    );
  }

  if (!CONTRACTS[network].usdToken) {
    const contractFactory = await ethers.getContractFactory("USDToken");
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    console.log(
      `Contract 'USDToken' deployed to: ${await contract.getAddress()}`
    );
  }

  if (!CONTRACTS[network].profileToken) {
    const contractFactory = await ethers.getContractFactory("ProfileToken");
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    console.log(
      `Contract 'ProfileToken' deployed to: ${await contract.getAddress()}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
