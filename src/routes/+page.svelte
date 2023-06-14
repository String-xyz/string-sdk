<script lang="ts">
    import { StringPayButton } from "$lib";
    import type { StringPay, StringPayload } from "$lib/sdk";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { ethers } from "ethers";
    import { subscribe } from "svelte/internal";

    const signerAddress = writable("");

    const IPFS_GATEWAY = "https://nftstorage.link/ipfs/";
    const IPFS_CID = "bafybeieqi56p6vlxofj6wkoort2m5r72ajhtikpzo53wnyze5isvn34fze";

    const STR_NFT_SRC = `${IPFS_GATEWAY}${IPFS_CID}/Demo_Character_1.png`;

    $: payload = {
        assetName: "String Test NFT [AVAX]",
        collection: "String Demo",
        imageSrc: STR_NFT_SRC,
        imageAlt: "String NFT",
        price: "0.08",
        currency: "AVAX",
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
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        signerAddress.set(ethers.utils.getAddress(accounts[0]));

        window.ethereum.on("accountsChanged", (accounts: any) => {
            signerAddress.set(ethers.utils.getAddress(accounts[0]));
        });
    });

    function submit() {
        console.log(">>> submit");
        const stringPay: StringPay = window.StringPay;
        stringPay.submitCard();

        stringPay.subscribeTo("card_tokenized", (data: any) => {
            console.log(">>> card_tokenized", data);
        });
    }
</script>

<div>
    <StringPayButton {payload} {disabled} />
    <!-- <div class="string-checkout-frame" /> -->
    <div class="string-payment-frame" />
    <button class="btn btn-secondary rounded border-2 tracking-wider text-white h-11" on:click={() => submit()}>Submit</button>
</div>
