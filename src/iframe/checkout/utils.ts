import type { User, StringPayload, CheckoutIframePayload, NFT } from "../../types";

// Parse payload before sending it to the iframe
export function createCheckoutIframePayload(payload: StringPayload, user: User | null): CheckoutIframePayload {
    const nft: NFT = {
        assetName: payload.assetName,
        price: payload.price,
        currency: payload.currency,
        collection: payload.collection ?? "",
        imageSrc: payload.imageSrc,
        imageAlt: payload?.imageAlt ?? "NFT",
    };

    return {
        nft,
        user: {
            walletAddress: payload.userAddress,
            id: user?.id ?? "",
            status: user?.status ?? "",
            email: user?.email ?? "",
        },
    };
}
