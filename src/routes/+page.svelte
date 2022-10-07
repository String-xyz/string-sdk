<script>
	import StringPayButton from "$lib/StringPayButton.svelte";
	import { StringPay } from '$lib/StringPay';
	import { onMount } from 'svelte';

	const userAddr = "0x41e11ff9f71f51800f67cb913ea6bc59d3f126aa"

	StringPay.init({
		apiKey: "xd"
	});

	const payload = {
		name: "String Demo NFT",
		collection: "String Demo",
		imageSrc: "https://gateway.pinata.cloud/ipfs/bafybeibtmy26mac47n5pp6srds76h74riqs76erw24p5yvdhmwu7pxlcx4/STR_Logo_1.png",
		imageAlt: "NFT",
		currency: "AVAX",
		price: 0.08,
		chainID: 43113,
		userAddress: userAddr,
		contractAddress: "0x41e11ff9f71f51800f67cb913ea6bc59d3f126aa",
		contractABI: ['function getOwnedIDs(address owner) view returns (uint256[])', 'function tokenURI(uint256 tokenId) view returns (string)'],
		contractFunction: 'mintTo',
		contractParameters: [userAddr],
		txValue: (0.08 * 1e18).toString()
	}

</script>

<div class="">
	<StringPayButton {payload} />
	<div class="string-pay-frame" />
</div>