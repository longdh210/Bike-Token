require("@nomicfoundation/hardhat-toolbox");
const key = require("./key.json");

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 5000,
      },
    },
    goerli: {
      chainId: 5,
      url: "https://eth-goerli.g.alchemy.com/v2/BAexJjh839qZdzF1_CxPlqcd3WRQexU9",
      accounts: [key.PRIVATE_KEY],
    },
    sepolia: {
      chainId: 11155111,
      url: "https://sepolia.infura.io/v3/2fbcbe6d19904f0daaf8b5f4d58d9421",
      accounts: [key.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: "GU9I8IGYKY43RYC758W6E5K69Y5FJIRJ98",
  },
  solidity: "0.8.4",
};
