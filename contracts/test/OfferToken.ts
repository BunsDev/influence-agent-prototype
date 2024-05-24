import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("OfferToken", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();
    // Deploy contracts
    const usdTokenContractFactory = await ethers.getContractFactory("USDToken");
    const usdTokenContract = await usdTokenContractFactory.deploy();
    const offerTokenContractFactory = await ethers.getContractFactory(
      "OfferToken"
    );
    const offerTokenContract = await offerTokenContractFactory.deploy(
      ethers.ZeroHash,
      ethers.ZeroAddress,
      0
    );
    // Send usd tokens to users
    await usdTokenContract
      .connect(deployer)
      .transfer(userOne, ethers.parseEther("1000"));
    await usdTokenContract
      .connect(deployer)
      .transfer(userTwo, ethers.parseEther("1000"));
    return {
      deployer,
      userOne,
      userTwo,
      userThree,
      usdTokenContract,
      offerTokenContract,
    };
  }

  // TODO: Delete only attribute
  it.only("Should support the main flow", async function () {
    const { userOne, userTwo, usdTokenContract, offerTokenContract } =
      await loadFixture(initFixture);
    // Create offer
    await expect(
      usdTokenContract
        .connect(userOne)
        .approve(offerTokenContract.getAddress(), ethers.MaxUint256)
    ).to.be.not.reverted;
    await expect(
      offerTokenContract
        .connect(userOne)
        .create(userTwo, ethers.parseEther("42"), usdTokenContract, "ipfs://1")
    ).to.be.not.reverted;
    const tokenId = (await offerTokenContract.getNextTokenId()) - 1n;
    // Accept offer
    await expect(
      offerTokenContract.connect(userTwo).accept(tokenId)
    ).to.changeTokenBalances(
      usdTokenContract,
      [userOne, offerTokenContract],
      [ethers.parseEther("-42"), ethers.parseEther("42")]
    );
    // Complete offer
    await expect(
      offerTokenContract.connect(userTwo).complete(tokenId, "ipfs://2")
    ).to.be.not.reverted;
    // Confirm offer
    await expect(
      offerTokenContract.connect(userTwo).close(tokenId)
    ).to.changeTokenBalances(
      usdTokenContract,
      [userTwo, offerTokenContract],
      [ethers.parseEther("42"), ethers.parseEther("-42")]
    );
  });
});
