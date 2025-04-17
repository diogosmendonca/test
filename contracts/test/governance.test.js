const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Governance", function () {
  let Governance;
  let governance;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    Governance = await ethers.getContractFactory("Governance");
    governance = await Governance.deploy();
    await governance.waitForDeployment(); // Use waitForDeployment instead of deployed()
  });

  it("Should create a proposal", async function () {
    const title = "Test Proposal";
    const description = "This is a test proposal description.";

    await governance.createProposal(title, description);

    const proposals = await governance.getAllProposals();
    expect(proposals.length).to.equal(1);
    expect(proposals[0].title).to.equal(title);
    expect(proposals[0].description).to.equal(description);
  });

  it("Should retrieve all proposals", async function () {
    const proposal1Title = "Proposal 1";
    const proposal1Desc = "Description 1";
    const proposal2Title = "Proposal 2";
    const proposal2Desc = "Description 2";

    await governance.createProposal(proposal1Title, proposal1Desc);
    await governance.createProposal(proposal2Title, proposal2Desc);

    const proposals = await governance.getAllProposals();
    expect(proposals.length).to.equal(2);

    expect(proposals[0].title).to.equal(proposal1Title);
    expect(proposals[0].description).to.equal(proposal1Desc);
    expect(proposals[1].title).to.equal(proposal2Title);
    expect(proposals[1].description).to.equal(proposal2Desc);
  });

  it("Should return an empty array if no proposals exist", async function () {
    const proposals = await governance.getAllProposals();
    expect(proposals.length).to.equal(0);
  });
}); 