import type { ApiClient } from "@src/types";

export function createWalletService() {
    function setWalletAddress(address: string) {
        walletAddress = address;
    }

    async function getWalletAddress(): Promise<string> {
        return (await window.ethereum.request({ method: "eth_requestAccounts" }))[0];
    }

    return {
        setWalletAddress,
        getWalletAddress,
    };
}
