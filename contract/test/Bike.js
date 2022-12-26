const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("Bike contract", function () {
  async function deployTokenFixture() {
    const Bike = await ethers.getContractFactory("Bike");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const bike = await Bike.deploy(owner.address);

    await bike.deployed();

    await bike.addAmountToken("White", 80);

    return { bike, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { bike, owner } = await loadFixture(deployTokenFixture);

      expect(await bike.owner()).to.equal(owner.address);
    });
  });

  describe("Get and set fee", function () {
    it("Should get fee successfully", async function () {
      const { bike, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // Get fee
      expect(await bike.getFee()).to.equal(
        ethers.utils.parseUnits("0.01", "ether")
      );
    });

    it("Should set fee successfully", async function () {
      const { bike, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // Set fee
      expect(await bike.setFee(1)).to.change;
    });
  });

  describe("Set base uri", function () {
    it("Should set base uri successfully", async function () {
      const { bike, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // Set base uri
      expect(await bike.setBaseURI("youtube.com")).to.change;
    });
  });

  describe("Mint", function () {
    it("Should mint 5 tokens successfully", async function () {
      const { bike, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Mint 5 preorder token to addr1
      expect(
        await bike.safeMintMany(0, owner.address, 5, {
          value: ethers.utils.parseUnits(`0.05`, "ether"),
        })
      ).to.changeTokenBalance(bike, owner, 5);
    });
  });

  describe("Add token", function () {
    it("Should revert when not the owner", async function () {
      const { bike, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Revert when not the owner
      await expect(
        bike.connect(addr1).addAmountToken("Red", 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should add token successfully", async function () {
      const { bike, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Add token
      expect(await bike.addAmountToken("Red", 100)).to.change;
    });
  });

  describe("Withdraw", function () {
    it("Should revert when not the owner", async function () {
      const { bike, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Revert when not the owner
      await expect(bike.connect(addr1).withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should withdraw successfully", async function () {
      const { bike, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Add token
      expect(await bike.withdraw()).to.change;
    });
  });
});
