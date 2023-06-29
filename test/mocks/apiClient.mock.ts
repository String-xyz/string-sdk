import type { ApiClient, ExecutionRequest, TransactionRequest, UserUpdate, VisitorData } from "../../src/lib/services/apiClient.service";
import { __httpClient__ } from "./httpClient.mock";

export function createMockApiClient(): ApiClient {
    let _userWalletAddress = "";

    const authHeaders: any = {
        "X-Api-Key": "mock-api-key",
    };

    const setWalletAddress = (addr: string) => (_userWalletAddress = addr);
    const getWalletAddress = () => _userWalletAddress;

    async function requestLogin(walletAddress: string) {
        setWalletAddress(walletAddress);
        return { nonce: "mock-nonce" };
    }

    async function createUser(nonce: string, signature: string, visitor?: VisitorData) {
        return {
            authToken: {
                token: "mock-token",
                refreshToken: { token: "mock-refresh-token", expAt: new Date() },
                issuedAt: "mock-issue-date",
                expAt: "mock-expiration-date",
            },
            user: {
                id: "mock-user-id",
                firstName: "John",
                middleName: "Doe",
                lastName: "Smith",
                status: "active",
                type: "mock-type",
                tags: {},
                createdAt: "mock-create-date",
                updateAt: "mock-update-date",
                email: "mock-email",
            },
        };
    }

    async function updateUser(userId: string, update: UserUpdate) {
        return {
            id: "mock-user-id",
            firstName: "John",
            middleName: "Doe",
            lastName: "Smith",
            status: "active",
            type: "mock-type",
            tags: {},
            createdAt: "mock-create-date",
            updateAt: "mock-update-date",
            email: "mock-email",
        };
    }

    async function requestEmailVerification(userId: string, email: string) {
        return undefined;
    }

    async function requestDeviceVerification(nonce: string, signature: string, visitor: VisitorData) {
        return undefined;
    }

    async function loginUser(nonce: string, signature: string, visitor?: VisitorData, bypassDeviceCheck = false) {
        return {
            authToken: {
                token: "mock-token",
                refreshToken: { token: "mock-refresh-token", expAt: new Date() },
                issuedAt: "mock-issue-date",
                expAt: "mock-expiration-date",
            },
            user: {
                id: "mock-user-id",
                firstName: "John",
                middleName: "Doe",
                lastName: "Smith",
                status: "active",
                type: "mock-type",
                tags: {},
                createdAt: "mock-create-date",
                updateAt: "mock-update-date",
                email: "mock-email",
            },
        };
    }

    async function refreshToken(walletAddress: string) {
        return {
            authToken: {
                token: "mock-refresh-token",
                refreshToken: { token: "mock-refresh-token", expAt: new Date() },
                issuedAt: "mock-issue-date",
                expAt: "mock-expiration-date",
            },
            user: {
                id: "mock-user-id",
                firstName: "John",
                middleName: "Doe",
                lastName: "Smith",
                status: "active",
                type: "mock-type",
                tags: {},
                createdAt: "mock-create-date",
                updateAt: "mock-update-date",
                email: "mock-email",
            },
        };
    }

    async function logoutUser() {
        return undefined;
    }

    async function getUserStatus(userId: string) {
        return { status: "mock-status" };
    }

    async function getDeviceStatus(nonce: string, signature: string, visitor: VisitorData) {
        return { status: "mock-device-status" };
    }

    async function getUserEmailPreview(nonce: string, signature: string, visitor?: VisitorData) {
        return { email: "mock-email" };
    }

    async function getQuote(payload: TransactionRequest) {
        return {
            transactionRequest: payload,
            estimate: {
                timestamp: Date.now(),
                baseUSD: "mock-base-usd",
                gasUSD: "mock-gas-usd",
                tokenUSD: "mock-token-usd",
                serviceUSD: "mock-service-usd",
                totalUSD: "mock-total-usd",
            },
            signature: "mock-signature",
        };
    }

    async function transact(payload: ExecutionRequest) {
        return { txID: "mock-transaction-id", txUrl: "mock-transaction-url" };
    }

    return {
        httpClient: __httpClient__,
        requestLogin,
        createUser,
        updateUser,
        requestEmailVerification,
        requestDeviceVerification,
        loginUser,
        refreshToken,
        logoutUser,
        getUserStatus,
        getDeviceStatus,
        getUserEmailPreview,
        getQuote,
        transact,
        setWalletAddress,
        getWalletAddress,
    };
}

export const __apiClient__ = createMockApiClient();
