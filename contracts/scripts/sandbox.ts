import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'sandbox'");

  const network = hre.network.name;

  const usdTokenContract = await ethers.getContractAt(
    "USDToken",
    CONTRACTS[network].usdToken as `0x${string}`
  );
  const offerTokenContract = await ethers.getContractAt(
    "OfferToken",
    CONTRACTS[network].offerToken as `0x${string}`
  );

  // Create
  // const approveTx = await usdTokenContract.approve(
  //   offerTokenContract.getAddress(),
  //   ethers.MaxUint256
  // );
  // await approveTx.wait();
  // const createTx = await offerTokenContract.create(
  //   "0x4306D7a79265D2cb85Db0c5a55ea5F4f6F73C4B1",
  //   ethers.parseEther("5"),
  //   "0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59",
  //   "ipfs://123"
  // );
  // await createTx.wait();

  // Accept
  // const acceptTx = await offerTokenContract.accept("0");
  // await acceptTx.wait();

  // Complete
  // const completeTx = await offerTokenContract.complete("0", "ipfs://abc");
  // await completeTx.wait();

  // Close
  // const completeTx = await offerTokenContract.close("0");
  // await completeTx.wait();

  // Print content
  // const content = await offerTokenContract.getContent("0");
  // console.log({ content });

  console.log("🏁 Script completed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
