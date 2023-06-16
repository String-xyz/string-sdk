import type { ApiClient } from "./apiClient.service";

export function createWalletService(apiClient: ApiClient) {
    let walletAddress = "";

    function setWalletAddress(address: string) {
        walletAddress = address;
    }

    function getWalletAddress() {
        return walletAddress;
    }

    // Subscribe to wallet change events
    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setWalletAddress(accounts[0]);

        apiClient.setWalletAddress(walletAddress);
        apiClient.logoutUser();

        // cleanup();
    });

    return {
        setWalletAddress,
        getWalletAddress,
    };
}
