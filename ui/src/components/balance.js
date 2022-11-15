import { ethers } from "ethers";
import ContractABI from "../artifacts/contracts/Bike.sol/Bike.json";
import { bikeTokenAddress } from "../config";
import Web3Modal from "web3modal";

export const balanceOf = async (_address) => {
  const web3modal = new Web3Modal();
  const connection = await web3modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);

  const contract = new ethers.Contract(
    bikeTokenAddress,
    ContractABI.abi,
    provider
  );

  let result = await contract.balanceOf(_address);
  return result;
};

export const tokenOfOwnerByIndex = async (address, index) => {
  const web3modal = new Web3Modal();
  const connection = await web3modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);

  const contract = new ethers.Contract(
    bikeTokenAddress,
    ContractABI.abi,
    provider
  );

  let result = await contract.tokenOfOwnerByIndex(address, index);
  return result;
};
