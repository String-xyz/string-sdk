<script lang="ts">
	import { StringPayButton } from "$lib";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import { ethers } from "ethers";

	const signerAddress = writable("");

	const STR_API_KEY = import.meta.env.VITE_STRING_API_KEY;

	const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY
	const IPFS_CID = import.meta.env.VITE_IPFS_CID

	const STR_NFT_SRC = `${IPFS_GATEWAY}${IPFS_CID}/Demo_Character_1.png`

	$: payload = {
		assetName: "String Test NFT [AVAX]",
		collection: "String Demo",
		imageSrc: STR_NFT_SRC,
		imageAlt: "String NFT",
		currency: "AVAX",
		price: 0.08,
		chainID: 43113,
		userAddress: $signerAddress,
		contractAddress: "0xea1ffe2cf6630a20e1ba397e95358daf362c8781",
		contractFunction: "mintTo(address)",
		contractReturn: "uint256",
		contractParameters: [$signerAddress],
		txValue: "0.08 eth",
	};

	$: disabled = !$signerAddress;

	onMount(async () => {
		if (!window.StringPay) {
			console.error("[String Pay] Cannot find stringpay module in DOM");
		}

		window.StringPay.init({
			env: "LOCAL",
			publicKey: STR_API_KEY,
		});


		const accounts = await window.ethereum.request({
			method: "eth_requestAccounts",
		});

		signerAddress.set(ethers.utils.getAddress(accounts[0]));

		window.ethereum.on("accountsChanged", (accounts: any) => {
			signerAddress.set(ethers.utils.getAddress(accounts[0]));
		});
	});
</script>

<div>
	<StringPayButton {payload} {disabled} />
	<div class="string-pay-frame" />
</div>
