const hre = require("hardhat");
const fs = require("fs");
const key = require("../key.json");

async function main() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Bike = await hre.ethers.getContractFactory("Bike");
    const bike = await Bike.deploy(owner.address, 100);

    await bike.deployed();
    await bike.setDefaultRoyalty(owner.address, 5000);

    console.log("Land token deployed to:", bike.address);

    fs.writeFileSync(
        "./config.js",
        `const bikeTokenAddress = "${bike.address}"
        module.exports = { bikeTokenAddress };
        `
    );
    fs.writeFileSync(
        "../ui/src/config.js",
        `export const bikeTokenAddress = "${bike.address}"`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
