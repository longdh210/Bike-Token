const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("Land contract", function () {
    async function deployTokenFixture() {
        const Bike = await ethers.getContractFactory("Bike");
        const [owner, addr1, addr2] = await ethers.getSigners();

        const bike = await Bike.deploy(owner.address);

        await bike.deployed();

        return { bike, owner, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { bike, owner } = await loadFixture(deployTokenFixture);

            expect(await bike.owner()).to.equal(owner.address);
        });
    });

    describe("Mint", function () {
        it("Should revert if account don't have Preorder token", async function () {
            const { bike, owner, addr1, addr2 } = await loadFixture(
                deployTokenFixture
            );

            // Mint 5 preorder token to addr1
            await expect(
                land.safeMintMany(addr1.address, 5)
            ).to.be.revertedWith("You have not burn Preorder token yet");
        });

        // it("Should revert if account is not token's owner", async function () {
        //     const { land, owner, addr1, addr2 } = await loadFixture(
        //         deployTokenFixture
        //     );
        //     const PreorderToken = await ethers.getContractFactory(
        //         "PreorderToken"
        //     );
        //     const preorderToken = await PreorderToken.deploy(land.address);
        //     await preorderToken.deployed();

        //     await preorderToken.connect(addr1).safeMint(addr1.address, {
        //         value: ethers.utils.parseUnits("0.1", "ether"),
        //     });

        //     await land.setPreorderContract(preorderToken.address);

        //     // Mint 1 preorder token to owner
        //     await expect(
        //         land.connect(addr2).safeMint(addr2.address, 1)
        //     ).to.be.revertedWith("You can not mint Land token");
        // });
    });

    describe("Transactions", function () {
        it("Should revert transaction (token locked 3 months)", async function () {
            const { land, owner, addr1, addr2 } = await loadFixture(
                deployTokenFixture
            );
            const PreorderToken = await ethers.getContractFactory(
                "PreorderToken"
            );
            const preorderToken = await PreorderToken.deploy(
                owner.address,
                land.address
            );
            await preorderToken.deployed();

            await preorderToken.connect(addr1).safeMint(addr1.address, {
                value: ethers.utils.parseUnits("0.1", "ether"),
            });

            // Set Preorder contract address for Land contract to interact
            await land.setPreorderContract(preorderToken.address);

            // Swap (burn) token from Preorder contract
            await preorderToken.connect(addr1).burn(1);

            // Mint 1 preorder token to owner
            await expect(
                land
                    .connect(addr1)
                    .transferFrom(addr1.address, addr2.address, 1)
            ).to.be.revertedWith("Token locked");
        });
    });
});
