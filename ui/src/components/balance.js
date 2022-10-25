import { ethers } from "ethers";
import ContractABI from "../artifacts/contracts/Bike.sol/Bike.json";
import { bikeTokenAddress } from "../config";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export const balanceOf = async (_address) => {
    const contract = new ethers.Contract(
        bikeTokenAddress,
        ContractABI.abi,
        provider
    );

    let result = await contract.balanceOf(_address);
    return result;
};

export const tokenOfOwnerByIndex = async (address, index) => {
    const contract = new ethers.Contract(
        bikeTokenAddress,
        ContractABI.abi,
        provider
    );

    let result = await contract.tokenOfOwnerByIndex(address, index);
    return result;
};
