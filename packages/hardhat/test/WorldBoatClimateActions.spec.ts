import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { WorldBoatClimateActions, WBToken, WorldBoatProtocol } from "../typechain-types";

describe("WorldBoatProtocol", function () {
  async function deployContractsFixture() {
    const deployer = await ethers.getNamedSigner("deployer");
    const [owner, to, projectOwner] = await ethers.getSigners();

    const testTokenFactory = await ethers.getContractFactory("WBToken");
    const token = (await testTokenFactory.deploy()) as WBToken;
    await token.deployed();

    const protocolFactory = await ethers.getContractFactory("WorldBoatProtocol");
    const protocol = (await protocolFactory.deploy()) as WorldBoatProtocol;
    await protocol.deployed();

    const wbcaFactory = await ethers.getContractFactory("WorldBoatClimateActions");
    const wbca = (await wbcaFactory.deploy(protocol.address, token.address)) as WorldBoatClimateActions;
    await wbca.deployed();

    await protocol.setup(wbca.address);

    const projectId = 100n;
    return {
      deployer,
      protocol,
      projectId,
      wbca,
      owner,
      to,
      projectOwner,
      token,
    };
  }

  describe("Create offer", function () {
    it("Should deploy and create offer", async function () {
      const { wbca, owner, to, projectId, token } = await loadFixture(deployContractsFixture);
      const uri = "";
      const regionalCode = 0;
      const category = 10;
      await wbca
        .connect(owner)
        .safeMint(to.address, uri, 1n, projectId, regionalCode, category, true, 1n);

      const tokenId = await wbca.currentTokenId();
      expect(tokenId).to.equal(1n);
      const stat = await wbca.getTokenStats(tokenId);
      expect(stat.projectId).to.equal(projectId);
      expect(stat.category).to.equal(category);

    });
  });

  describe("Create Project", function () {
    it("Should deploy and create project", async function () {
      const { projectId, protocol, projectOwner } = await loadFixture(deployContractsFixture);
      const regionalCode = 0;
      const category = 10;

      await protocol
        .connect(projectOwner)
        .createProject(10n, 100n, projectId, regionalCode, category, "tree plant project");

      const project = await protocol.getProject(projectId);
      expect(project.projectId).to.equal(projectId);
      expect(project.projectOwner).to.equal(projectOwner.address);
      // expect(ethers.utils.parseBytes32String(project.metadataProject)).to.equal("tree plant project");
      expect(project.metadataProject).to.equal("tree plant project");

    });

    it("Should automatch with trusted project owner", async function () {
      const { owner, wbca, to, projectId, protocol, token, projectOwner } = await loadFixture(deployContractsFixture);
      const uri = "";
      const regionalCode = 0;
      const category = 10;

      await wbca
        .connect(owner)
        .safeMint(to.address, uri, 1000n, projectId, regionalCode, category, true, 1n);

      await protocol.connect(owner).addTrustedProject(projectOwner.address);

      await protocol
        .connect(projectOwner)
        .createProject(10n, 100n, projectId, regionalCode, category, "tree plant project");

      const state = await wbca.getTokenStats(1n);
      expect(state.projectId).to.equal(projectId);
      expect(state.co2ActuallyOffset).to.equal(10n);
      expect(state.co2OffsetPlanned).to.equal(990n);
      expect(state.metadataProject).to.equal("tree plant project");

    });

    it("Should automatch with trusted project owner", async function () {
      const { owner, wbca, to, projectId, protocol, token, projectOwner } = await loadFixture(deployContractsFixture);
      const uri = "";
      const regionalCode = 0;
      const category = 10;

      await wbca
        .connect(owner)
        .safeMint(to.address, uri, 1000n, projectId, regionalCode, category, true, 1n);

      await protocol
        .connect(projectOwner)
        .createProject(100000n, 10000n, projectId, regionalCode, category, "tree plant project");

      const state = await wbca.getTokenStats(1n);
      expect(state.projectId).to.equal(projectId);
      expect(state.co2ActuallyOffset).to.equal(1000n);
      expect(state.co2OffsetPlanned).to.equal(0n);
      expect(state.metadataProject).to.equal("tree plant project");


      const project = await protocol.getProject(projectId);
      expect(project.projectId).to.equal(projectId);
      expect(project.projectOwner).to.equal(projectOwner.address);
      expect(project.co2OffsetPlanned).to.equal(100000-1000);
      expect(project.metadataProject).to.equal("tree plant project");
    });
  });
});
