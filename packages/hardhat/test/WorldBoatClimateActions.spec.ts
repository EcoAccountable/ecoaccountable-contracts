import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { WorldBoatClimateActions, WBToken } from "../typechain-types";

describe("YourContract", function () {
  async function deployContractsFixture() {
    const deployer = await ethers.getNamedSigner("deployer");
    const [owner, to, treasury] = await ethers.getSigners();
    const wbcaFactory = await ethers.getContractFactory("WorldBoatClimateActions");
    const wbca = (await wbcaFactory.deploy(treasury.address)) as WorldBoatClimateActions;
    await wbca.deployed();

    const testTokenFactory = await ethers.getContractFactory("WBToken");
    const token = (await testTokenFactory.deploy()) as WBToken;
    await token.deployed();

    const projectId = 100n;
    return {
      deployer,
      treasury,
      projectId,
      wbca,
      owner,
      to,
      token,
    };
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { deployer, wbca, owner, to, projectId, treasury, token } = await loadFixture(deployContractsFixture);
      await token.connect(owner).approve(wbca.address, 100n);
      console.log("allowance === " + await token.allowance(owner.address, treasury.address));
      console.log("deployer================" + deployer.address);
      const uri = "";
      const regionalCode = 0;
      const category = 10;
      await wbca
        .connect(owner)
        .safeMint(to.address, uri, 1n, projectId, regionalCode, category, true, token.address, 1n);
    });
  });
});
