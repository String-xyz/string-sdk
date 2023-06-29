export function createWalletService() {
    async function getWalletAddress(): Promise<string> {
        return (await window.ethereum.request({ method: "eth_requestAccounts" }))[0];
    }

    return {
        getWalletAddress,
    };
}
