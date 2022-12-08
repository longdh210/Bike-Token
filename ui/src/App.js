import logo from "./logo.svg";
import "./App.css";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import ContractABI from "./artifacts/contracts/Bike.sol/Bike.json";
import { bikeTokenAddress } from "./config";
import { balanceOf, tokenOfOwnerByIndex } from "./components/balance";
import { useEffect, useState, CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnectProvider from "@walletconnect/web3-provider";

function App() {
  const [amount, setAmount] = useState("");
  let [loading, setLoading] = useState(false);
  let [token, setToken] = useState([]);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [itemId, setItemId] = useState(null);

  let web3Modal = new Web3Modal({
    network: "goerli",
    cacheProvider: false, // optional
    providerOptions: {
      binancechainwallet: {
        package: true,
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK, // Required
        options: {
          appName: "a2cfc47d9a4f408ea304fef5b70e5599", // Required
          infuraId: process.env.INFURA_ID, // Required
          chainId: 4,
        },
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "a2cfc47d9a4f408ea304fef5b70e5599",
        },
      },
    }, // required
  });

  window.ethereum.on("accountsChanged", async function (accounts) {
    if (web3Provider != null) {
      setConnectedAccount(accounts[0]);
      let balanceTemp = await balanceOf(accounts[0]);
      if (balanceTemp > 0) {
        let tokenArrayTemp = [];
        for (let i = 0; i < balanceTemp; i++) {
          let tokenTemp = await tokenOfOwnerByIndex(accounts[0], i);
          if (!tokenArrayTemp.includes(tokenTemp.toString())) {
            tokenArrayTemp.push(tokenTemp.toString());
          }
        }
        await setToken(tokenArrayTemp);
      }
    }
  });

  const connectWallet = async () => {
    try {
      const web3ModalInstance = await web3Modal.connect();
      const web3ModalProvider = new ethers.providers.Web3Provider(
        web3ModalInstance
      );
      if (web3ModalProvider) {
        setWeb3Provider(web3ModalProvider);
      }
      setConnectedAccount(web3ModalProvider.provider.selectedAddress);
      let balanceTemp = await balanceOf(
        web3ModalProvider.provider.selectedAddress
      );
      if (balanceTemp.toString() > 0) {
        let tokenArrayTemp = [];
        for (let i = 0; i < balanceTemp; i++) {
          let tokenTemp = await tokenOfOwnerByIndex(
            web3ModalProvider.provider.selectedAddress,
            i
          );
          if (!tokenArrayTemp.includes(tokenTemp.toString())) {
            tokenArrayTemp.push(tokenTemp.toString());
          }
        }
        await setToken(tokenArrayTemp);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const disconnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    setWeb3Provider(null);
    setConnectedAccount(null);
  };

  const handleBuyClick = async () => {
    if (isNaN(amount)) {
      alert("Please enter number !");
    } else if (!amount) {
      alert("Enter amount");
    } else if (Number(amount) > 100) {
      alert("Mint more than allowed");
    } else {
      setLoading(true);
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      const valueAmount = 0.01 * amount;

      let valuePass = ethers.utils.parseUnits(`${valueAmount}`, "ether");
      valuePass = valuePass.toString();

      let contract = new ethers.Contract(
        bikeTokenAddress,
        ContractABI.abi,
        signer
      );
      try {
        let transaction = await contract.safeMintMany(
          Number(itemId),
          signerAddress,
          amount,
          {
            value: valuePass,
          }
        );
        await transaction.wait();
        let transactionData = await provider.getTransactionReceipt(
          transaction.hash
        );
        if (transactionData.status == 1) {
          alert("Buy token successfully");
        } else {
          alert("Transaction failed");
        }
        setLoading(false);
      } catch (e) {
        console.log(e);
        alert(e.reason);
        setLoading(false);
      }
    }
  };

  const handleChangeItemName = (e) => {
    let { name, value } = e.target;
    console.log(name, value);
    setItemId(value);
  };

  return (
    <div className='App'>
      <div className='balance'>
        <label
          style={{
            color: "white",
            fontSize: "30px",
          }}
        >
          Bike token id own: {token.toString()}
        </label>
      </div>
      <div className='content'>
        <h1
          style={{
            color: "white",
            fontSize: "100px",
          }}
        >
          Preorder Bike Token
        </h1>
        <br></br>
        {web3Provider == null ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <button onClick={disconnectWallet}>Disconnect</button>
        )}
        <br></br>
        <h2
          style={{
            color: "white",
          }}
        >
          Hi: {connectedAccount != null ? connectedAccount : ""}
        </h2>
        <br></br>
        <br></br>
        <div>
          <h3
            style={{
              color: "white",
            }}
          >
            Item name
          </h3>
          <select
            id='item-name'
            name='item-name'
            style={{
              height: "30px",
              width: "200px",
            }}
            onChange={handleChangeItemName}
          >
            <option value='0'>Zero Livery</option>
            <option value='1'>Collab Skin 1</option>
            <option value='2'>Collab Skin 2</option>
            <option value='3'>Midas</option>
            <option value='4'>Hayate Corporate Skin</option>
            <option value='5'>Tiffany Blue</option>
            <option value='6'>Candy Crush</option>
            <option value='7'>Dracula Red</option>
            <option value='8'>Cold Steel</option>
            <option value='9'>White</option>
          </select>
        </div>
        <br></br>
        <input
          placeholder='Amount of token want to buy'
          style={{
            height: "30px",
            width: "200px",
          }}
          onChange={(e) => setAmount(e.target.value)}
        ></input>
        <br></br>
        <button
          style={{
            height: "60px",
            width: "120px",
            background: "#4DC1BF",
            borderRadius: "10px",
            marginTop: "10px",
            color: "white",
            fontWeight: "bold",
          }}
          onClick={() => handleBuyClick()}
        >
          Buy Preorder NFT
        </button>
      </div>
      {loading ? (
        <div className='WrapLoader'>
          <div className='Loader'>
            <ClipLoader color='#36d7b7' loading size={150} />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
