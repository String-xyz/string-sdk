import type { HttpClient } from "$lib/httpClient";

export function createApiClient(httpClient: HttpClient, apiKey: string): ApiClient {
    let _userWalletAddress = "";

    const authHeaders: any = {
        "X-Api-Key": apiKey,
    };

    const setWalletAddress = (addr: string) => (_userWalletAddress = addr);
    const getWalletAddress = () => _userWalletAddress;

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

    async function getUserEmailPreview(nonce: string, signature: string, fingerprint?: VisitorData) {
        // The request body takes a fingerprint but it does not matter what it is
        const body = {
            nonce,
            signature,
            fingerprint: fingerprint ? fingerprint : { visitorId: "", requestId: "" },
        };
        try {
            const { data } = await httpClient.post<{ email: string }>(`/users/preview-email`, body, {
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
        httpClient,
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
        getWalletAddress,
    };
}
