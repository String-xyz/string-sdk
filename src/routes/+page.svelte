<script lang="ts">
	import { StringPayButton } from '$lib';
    import { connect, walletAddress } from '$lib/wallet';
    import { onMount } from 'svelte';

	const apiKey = import.meta.env.VITE_STRING_API_KEY

	$: payload = {
		apiKey,
		name: "String Demo NFT",
		collection: "String Demo",
		imageSrc: "https://gateway.pinata.cloud/ipfs/bafybeibtmy26mac47n5pp6srds76h74riqs76erw24p5yvdhmwu7pxlcx4/STR_Logo_1.png",
		imageAlt: "NFT",
		currency: "AVAX",
		price: 0.08,
		chainID: 43113,
		userAddress: $walletAddress,
		contractAddress: "0x41e11fF9F71f51800F67cb913eA6Bc59d3F126Aa",
		contractFunction: "mintTo(address)",
		contractReturn: "uint256",
		contractParameters: [$walletAddress],
		txValue: "0.08 eth",
	}

	onMount(async () => {
		await connect();
	});
	
</script>

<div>
	<StringPayButton {payload} />
	<div class="string-pay-frame" />
</div>