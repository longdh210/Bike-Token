<script lang="ts">
	// Svelte
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	// Third -party dependencies
	import { BigNumber, ethers } from 'ethers';

	// External files from the contract project
	import { bikeTokenAddress } from '$lib/config.js';
	import ContractABI from '$lib/artifacts/contracts/Bike.sol/Bike.json';

	let currentAddress: any = null;
	let currentBalance: any = 0;
	let tokens: any[] = [];

	let showModalConnectWallet = false;
	let showModalProcessing = false;

	let balanceOf = async (address: any) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const contract = new ethers.Contract(bikeTokenAddress, ContractABI.abi, provider);

		let result = await contract.balanceOf(address);
		return result;
	};

	let tokenOfOwnerByIndex = async (address: any, index: any) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const contract = new ethers.Contract(bikeTokenAddress, ContractABI.abi, provider);

		let result = await contract.tokenOfOwnerByIndex(address, index);
		return result;
	};

	let getAccountItems = async () => {
		window.ethereum.request({ method: 'eth_requestAccounts' }).then(async (res: string[]) => {
            debugger;
			currentAddress = res[0];
			let tempBalance = (await balanceOf(currentAddress)) as BigNumber;

			if (typeof tempBalance == 'undefined') {
				throw new Error('undefined balance');
			}

			currentBalance = tempBalance;

			let tempTokens: String[] = [];

			for (let i = 0; i < currentBalance; i++) {
				let tokenTemp = (await tokenOfOwnerByIndex(currentAddress, i)).toString();
				if (!tempTokens.includes(tokenTemp)) {
					tempTokens.push(tokenTemp);
				}
			}

			tokens = tempTokens;
		});
	};

    let handleConnect = async () => {
        await getAccountItems();
    }

	let handleBuy = async () => {
		showModalProcessing = true;
		// const web3modal = new Web3Modal();
		// const connection = await web3modal.connect();

		// A Web3Provider wraps a standard Web3 provider, which is
		// what MetaMask injects as window.ethereum into each page
		const provider = new ethers.providers.Web3Provider(window.ethereum);

		// MetaMask requires requesting permission to connect users accounts
		await provider.send('eth_requestAccounts', []);

		const signer = provider.getSigner();
		const signerAddress = await signer.getAddress();

		let amount = 1;
		const valueAmount = 0.01 * amount;

		let valuePass = ethers.utils.parseUnits(`${valueAmount}`, 'ether').toString();

		let contract = new ethers.Contract(bikeTokenAddress, ContractABI.abi, signer);

		try {
			let transaction = await contract.safeMintMany(signerAddress, amount, {
				value: valuePass
			});
			await transaction.wait();
			let transactionData = await provider.getTransactionReceipt(transaction.hash);
            debugger;
			if (transactionData.status == 1) {
				alert('Buy token successfully');
				await getAccountItems();
			} else {
				alert('Transaction failed');
			}
		} catch (e) {
			console.log(e);
			alert('Transaction failed');
		} finally {
			showModalProcessing = false;
		}
	};

	onMount(() => {});
</script>

<div>
	<button on:click={handleConnect}>Connect</button>
	<button on:click={handleBuy}>Buy</button>
</div>

{#if showModalProcessing}
	<div class="">Processing...</div>
{/if}

<div>Items owned: {tokens.join(', ')}</div>
<div class="">Other content goes here.</div>
