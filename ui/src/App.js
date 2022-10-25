import logo from "./logo.svg";
import "./App.css";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import ContractABI from "./artifacts/contracts/Bike.sol/Bike.json";
import { bikeTokenAddress } from "./config";
import { balanceOf, tokenOfOwnerByIndex } from "./components/balance";
import { useEffect, useState, CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
};

function App() {
    const [amount, setAmount] = useState("");
    const [currentAddress, setCurrentAddress] = useState(null);
    const [balance, setBalance] = useState(0);
    let [loading, setLoading] = useState(false);
    let [token, setToken] = useState([]);
    // let token = [];

    useEffect(() => {}, [token]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum
                .request({ method: "eth_requestAccounts" })
                .then(async (res) => {
                    setCurrentAddress(res[0]);
                    let balanceTemp = await balanceOf(res[0]);
                    if (balanceTemp != undefined) {
                        setBalance(balanceTemp);
                    }
                    let tokenArrayTemp = [];
                    for (let i = 0; i < balanceTemp; i++) {
                        let tokenTemp = await tokenOfOwnerByIndex(res[0], i);
                        if (!tokenArrayTemp.includes(tokenTemp.toString())) {
                            tokenArrayTemp.push(tokenTemp.toString());
                        }
                    }
                    setToken(tokenArrayTemp);
                });
        }
    }, []);

    window.ethereum.on("accountsChanged", async function (accounts) {
        setCurrentAddress(accounts[0]);
        let balanceTemp = await balanceOf(accounts[0]);
        setBalance(balanceTemp);
        let tokenArrayTemp = [];
        for (let i = 0; i < balanceTemp; i++) {
            let tokenTemp = await tokenOfOwnerByIndex(accounts[0], i);
            if (!tokenArrayTemp.includes(tokenTemp.toString())) {
                tokenArrayTemp.push(tokenTemp.toString());
            }
        }
        setToken(tokenArrayTemp);
    });

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
                alert("Transaction failed");
                setLoading(false);
            }
        }
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
                <h2
                    style={{
                        color: "white",
                    }}
                >
                    Hi: {currentAddress}
                </h2>
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
