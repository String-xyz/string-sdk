import axios from "redaxios";

// TODO: Fix timeout issue

export function createApiClient({ baseUrl, apiKey }: ApiClientOptions): ApiClient {
    let _userWalletAddress = "";

    const commonHeaders: any = {
        "Content-Type": "application/json",
    };

    const authHeaders: any = {
        "X-Api-Key": apiKey,
    };

    const httpClient = axios.create({
        baseURL: baseUrl,
        headers: commonHeaders,
        withCredentials: true, // send cookies,
        // fetch: fetchWithTimeout(10000),
    });

    const setWalletAddress = (addr: string) => (_userWalletAddress = addr);

    async function requestLogin(walletAddress: string) {
        setWalletAddress(walletAddress);

        try {
            const { data } = await httpClient.get<{ nonce: string }>(`/login`, {
                params: { walletAddress: _userWalletAddress },
                headers: authHeaders,
            });

            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function createUser(nonce: string, signature: string, visitor?: VisitorData) {
        const body = {
            nonce,
            signature,
            fingerprint: visitor,
        };

        try {
            const { data } = await httpClient.post<AuthResponse>(`/users`, body, {
                headers: authHeaders,
            });
            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function updateUser(userId: string, update: UserUpdate) {
        try {
            const request = () => httpClient.patch<User>(`/users/${userId}`, update);
            const { data } = await authInterceptor<{ data: User }>(request);

            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function requestEmailVerification(userId: string, email: string) {
        try {
            const request = () =>
                httpClient.get(`/users/${userId}/verify-email`, {
                    params: { email },
                });

            await authInterceptor(request);
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function requestDeviceVerification(nonce: string, signature: string, visitor: VisitorData) {
        const body = {
            nonce,
            signature,
            fingerprint: visitor,
        };

        try {
            await httpClient.post<void>(`/users/verify-device`, body, {
                headers: authHeaders,
            });
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function loginUser(nonce: string, signature: string, visitor?: VisitorData, bypassDeviceCheck = false) {
        const body = {
            nonce,
            signature,
            fingerprint: visitor,
        };

        const bypassDevice = bypassDeviceCheck ? "?bypassDevice=true" : "";

        try {
            const { data } = await httpClient.post<AuthResponse>(`/login/sign${bypassDevice}`, body, {
                headers: authHeaders,
            });
            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function refreshToken(walletAddress: string) {
        try {
            const { data } = await httpClient.post<AuthResponse>(
                `/login/refresh`,
                { walletAddress },
                {
                    headers: authHeaders,
                },
            );
            console.debug(" - Token was refreshed");

            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function logoutUser() {
        try {
            const { status } = await httpClient.post(`/login/logout`);
            if (status !== 204) throw new Error("logout failed");
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function getUserStatus(userId: string) {
        try {
            const request = () => httpClient.get(`/users/${userId}/status`);
            const { data } = await authInterceptor<{
                data: { status: string };
            }>(request);

            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function getDeviceStatus(nonce: string, signature: string, visitor: VisitorData) {
        const body = {
            nonce,
            signature,
            fingerprint: visitor,
        };

        try {
            const { data } = await httpClient.post<{ status: string }>(`/users/device-status`, body, {
                headers: authHeaders,
            });

            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function getUserEmailPreview(nonce: string, signature: string) {
        // The request body takes a fingerprint but it does not matter what it is
        const body = {
            nonce,
            signature,
            fingerprint: {
                visitorId: "",
                requestId: "",
            }
        }
        try {
            const { data } = await httpClient.post<{email: string}>(`/users/preview-email`, body, {
                headers: authHeaders,
            });

            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function getSavedCards() {
        try {
            const { data } = await httpClient.get(`/cards`);
            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }
   
    async function getQuote(payload: ExecutionRequest) {
        try {
            const request = () => httpClient.post(`/quotes`, payload);
            const { data } = await authInterceptor<{ data: Quote }>(request);

            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    async function transact(payload: TransactionRequest) {
        try {
            const request = () => httpClient.post(`/transactions`, payload);
            const { data } = await authInterceptor<{
                data: TransactionResponse;
            }>(request);

            return data;
        } catch (e: any) {
            const error = _getErrorFromAxiosError(e);
            throw error;
        }
    }

    function _getErrorFromAxiosError(e: any) {
        if (e.data) return e.data;
        if (e.response) return e.response.data;
        else if (e.request) return e.request;
        if (e.message) return e.message;
        return e;
    }

    async function authInterceptor<T>(request: any): Promise<T> {
        try {
            const res = await request();
            return res;
        } catch (e: any) {
            const originalRequest = e.config;

            if (e.status === 401 && !_isRefreshTokenRequest(originalRequest)) {
                const data = await refreshToken(_userWalletAddress);
                if (data) {
                    // request again
                    return request();
                }
            }
            throw e;
        }
    }

    function _isRefreshTokenRequest(request: any) {
        return request.url === "/login/refresh";
    }

    return {
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
        getSavedCards,
        getQuote,
        transact,
        setWalletAddress,
    };
}

export interface ApiClient {
    requestLogin: (walletAddress: string) => Promise<{ nonce: string }>;
    createUser: (nonce: string, signature: string, visitor?: VisitorData) => Promise<AuthResponse>;
    updateUser: (userId: string, userUpdate: UserUpdate) => Promise<User>;
    requestEmailVerification: (userId: string, email: string) => Promise<void>;
    requestDeviceVerification: (nonce: string, signature: string, visitor: VisitorData) => Promise<void>;
    loginUser: (nonce: string, signature: string, visitor?: VisitorData, bypassDeviceCheck?: boolean) => Promise<AuthResponse>;
    refreshToken: (walletAddress: string) => Promise<AuthResponse>;
    logoutUser: () => Promise<void>;
    getUserStatus: (userId: string) => Promise<{ status: string }>;
    getDeviceStatus: (nonce: string, signature: string, visitor: VisitorData) => Promise<{ status: string }>;
    getUserEmailPreview: (nonce: string, signature: string) => Promise<{ email: string }>;
    getSavedCards: () => Promise<SavedCardResponse[]>;
    getQuote: (request: ExecutionRequest) => Promise<Quote>;
    transact: (request: TransactionRequest) => Promise<TransactionResponse>;
    setWalletAddress: (walletAddress: string) => void;
}

interface RefreshToken {
    token: string;
    expAt: Date;
}

interface AuthToken {
    token: string;
    refreshToken: RefreshToken;
    issuedAt: string;
    expAt: string;
}

export interface AuthResponse {
    authToken: AuthToken;
    user: User;
}

export interface UserUpdate {
    walletAddress?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
}

export interface User {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    status: string;
    type: string;
    tags: object;
    createdAt: string;
    updateAt: string;
    email?: string;
}

export interface VisitorData {
    visitorId?: string;
    requestId?: string;
}

export interface ExecutionRequest {
    userAddress: string;
    assetName: string;
    chainID: number;
    contractAddress: string;
    contractFunction: string;
    contractReturn: string;
    contractParameters: string[];
    txValue: string;
    gasLimit: string;
}

export interface Estimate {
    timestamp: number;
    baseUSD: string;
    gasUSD: string;
    tokenUSD: string;
    serviceUSD: string;
    totalUSD: string;
}

export interface Quote {
    request: ExecutionRequest;
    estimate: Estimate;
    signature: string;
}

export interface PaymentInfo {
    cardToken?: string;
    cardId?: string;
    cvv?: string;
    saveCard?: boolean;
}

export interface TransactionRequest {
    quote: Quote;
    paymentInfo: PaymentInfo;
}

export interface TransactionResponse {
    txID: string;
    txUrl: string;
    txTimestamp: string;
}

export interface SavedCardResponse {
	type: string;
	id: string;
	scheme: string;
	last4: string;
	expiryMonth: number;
	expiryYear: number;
	expired: boolean;
	cardType: string;
}

export interface ApiClientOptions {
    baseUrl: string;
    apiKey: string;
}
