<script lang="ts">
	// Svelte
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	// Blockchain dependencies
	import {
		chain,
		chainId,
		configureChains,
		createClient,
		getAccount,
		getContract,
		fetchBalance,
		watchAccount,
		watchContractEvent,
		watchNetwork,
		watchProvider,
		watchSigner,
		watchReadContract,
		Connector
	} from '@wagmi/core';
	import { infuraProvider } from "@wagmi/core/providers/infura";
	import type {Chain} from '@wagmi/core';
	import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
	import { ClientCtrl, ConfigCtrl, ModalCtrl, CoreHelpers } from '@web3modal/core';
	import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum';
	import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
	import { W3mModal, W3mCoreButton } from '@web3modal/ui';
	import { BigNumber, ethers } from 'ethers';

	// External files from the contract build output
	// NOTE: the _sepolia folder and config contain information for the contract deployed on sepolia testnet
	import { bikeTokenAddress } from '$lib/config_sepolia.js';
	import ContractABI from '$lib/artifacts_sepolia/contracts/Bike.sol/Bike.json';

	// UI
	let mounted = false;
	let showModalProcessing = false;

	// Blockchain related
	let currentAddress: `0x${string}` | undefined = undefined;
	let currentSigner: ethers.Signer | undefined = undefined;
	let currentChain: number | undefined = undefined;
	let contract: ethers.Contract | undefined = undefined;
	let currentTokens: string[] = [];
	let itemId: number = 0;

	// 1. Consts.
	// TODO: dynamically change the chain array in dev vs release
	const infuraId = 'a2cfc47d9a4f408ea304fef5b70e5599';
	const walletConnectId = '8eaeb6b52ea88b798c2b1905d1411a64';
	const chains = [chain.localhost, chain.goerli, chain.sepolia];

	// 2. Configure wagmi client
	const { provider } = configureChains(chains, [
		jsonRpcProvider({
			rpc: (chain) => ({
				http: 'http://127.0.0.1:8545'
			})
		}),
		infuraProvider({ infuraId }),
		walletConnectProvider({ projectId: walletConnectId })
	]);

	const wagmiClient = createClient({
		autoConnect: true,
		connectors: modalConnectors({ appName: 'web3Modal', chains}),
		provider
	});

	// 3. Configure ethereum client
	const ethereumClient = new EthereumClient(wagmiClient, chains);

	// 4. Configure modal and pass ethereum client to it
	ConfigCtrl.setConfig({
		projectId: walletConnectId,
		theme: 'dark',
		accentColor: 'default'
	});

	ClientCtrl.setEthereumClient(ethereumClient);

	watchAccount(async (data) => {
		console.log('watchAccount cb', data);

		if (data.isConnecting) {
			// TODO What do we need to do here?
		}

		if (data.isConnected) {
			currentAddress = data.address;
			currentChain = await data.connector?.getChainId();
		}

		if (data.isDisconnected) {
			currentAddress = undefined;
			currentSigner = undefined;
			currentChain = undefined;
			contract = undefined;
			currentTokens = [];

			// TODO any further clean up
		}
	});

	const handleWatchSigner = (chain: Chain, result: ethers.Signer | null) => {
		if (result !== null) {
			if (chain.id == currentChain) {
				currentSigner = result;
				contract = new ethers.Contract(bikeTokenAddress, ContractABI.abi, currentSigner);

				console.log('assign currentSigner', chain, currentSigner);
				console.log('contract', contract);

				getAccountItems();
			}
		}
	}

	// NOTE: Added a bunch of watch calls here for convenience during debug
	watchSigner({ chainId: chainId.mainnet }, (result) => {
		handleWatchSigner(chain.mainnet, result);
	});

	watchSigner({ chainId: chainId.localhost }, (result) => {
		handleWatchSigner(chain.localhost, result);
	});

	watchSigner({ chainId: chainId.goerli }, (result) => {
		handleWatchSigner(chain.goerli, result);
	});

	watchSigner({ chainId: chainId.sepolia }, (result) => {
		handleWatchSigner(chain.sepolia, result);
	});

	let getAccountItems = async () => {
		// NOTE: Ideally this should never happen,
		// as we should only call this function after a wallet has been succesfully connected.
		if (currentAddress === undefined) {
			alert('Please connect a wallet!');
			return;
		}

		let balance = await contract!.balanceOf(currentAddress);
		let tokens: string[] = [];

		for (let i = 0; i < balance; i++) {
			let tmp = await contract!.tokenOfOwnerByIndex(currentAddress, i);
			let tmpStr = tmp.toString();

			if (!tokens.includes(tmpStr)) {
				tokens.push(tmpStr);
			}
		}

		currentTokens = tokens;

		console.log('Got balance', balance);
	};

	const handleChangeItemName = (e: any) => {
    let { name, value } = e.target;
    	console.log(name, value);
    	itemId = value;
  	};

	let handleBuy = async () => {
		// NOTE: Ideally this should never happen,
		// as we should only call this function after a wallet has been succesfully connected.
		if (currentAddress === undefined) {
			alert('Please connect a wallet!');
			return;
		}

		showModalProcessing = true;

		const signerAddress = await currentSigner?.getAddress();
		console.log('signerAddress', signerAddress);

		let amount = 1;
		const valueAmount = 0.01 * amount;

		let valuePass = ethers.utils.parseUnits(`${valueAmount}`, 'ether').toString();

		try {
			let transaction = await contract!.safeMintMany(
          		itemId,
          		signerAddress,
          		amount,
				{
					value: valuePass,
				}
        	);

			let result = await transaction.wait();

			console.log('result', result);

			if (result.status == 1) {
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

	onMount(() => {
		console.log('onMount');

		// debugger;
		mounted = true;
	});

	onDestroy(() => {
		mounted = false;
	});
</script>

<!-- NOTE: Why is this conditional block needed? -->
<!-- Without this, the UI elements will initiate before the config code finish running, causing error. -->
{#if mounted}
	<div>
		<w3m-core-button />
		<w3m-modal />
		<div>
			<h3
			>
			  Item name
			</h3>
			<select
			  id='item-name'
			  name='item-name'
			  on:change={handleChangeItemName}
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
	</div>
{/if}

<div class="my-2">
	<button
		class="px-2 border border-1 bg-gray-400"
		disabled={currentAddress === undefined}
		on:click={handleBuy}>Buy</button
	>
</div>

{#if showModalProcessing}
	<div class="my-2">Processing...</div>
{/if}

<div class="grid grid-cols-1 gap-2">
	<div>Address: {currentAddress !== undefined ? currentAddress : 'Not connected.'}</div>
	<div>Chain: {currentChain != undefined ? currentChain : 'Not connected.'}</div>
	<div>Items owned: {currentTokens.join(', ')}</div>
	<div class="">Other content goes here.</div>
</div>
