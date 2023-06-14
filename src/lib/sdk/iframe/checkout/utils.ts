import type { User } from "$lib/sdk/services/apiClient.service";
import type { StringPayload } from "../../config";

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

export interface NFT {
    assetName: string;
    price: string;
    currency: string;
    collection?: string;
    imageSrc: string;
    imageAlt?: string;
}

export interface CheckoutIframePayload {
    nft: NFT;
    user: {
        id: string;
        walletAddress: string;
        status: string;
        email: string;
    };
}
