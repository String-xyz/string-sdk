<script lang="ts">
	import { StringPayButton } from "$lib";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import { ethers } from "ethers";

	const apiKey = import.meta.env.VITE_STRING_API_KEY;

	const signerAddress = writable("");

	$: payload = {
		name: "String Demo NFT",
		collection: "String Demo",
		imageSrc:
			"https://gateway.pinata.cloud/ipfs/bafybeibtmy26mac47n5pp6srds76h74riqs76erw24p5yvdhmwu7pxlcx4/STR_Logo_1.png",
		imageAlt: "NFT",
		currency: "AVAX",
		price: 0.08,
		chainID: 43113,
		userAddress: $signerAddress,
		contractAddress: "0x41e11fF9F71f51800F67cb913eA6Bc59d3F126Aa",
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
			publicKey: apiKey,
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
