import { ethers } from "ethers"
import { writable, type Writable } from "svelte/store";

export const walletAddress: Writable<string> = writable();

export const connect = async () => {
	if (!window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const accounts = await provider.send("eth_requestAccounts", []);

    provider.on('accountsChanged', (accounts) => {
		walletAddress.set(ethers.utils.getAddress(accounts[0]));
    });

	walletAddress.set(ethers.utils.getAddress(accounts[0]));
}
