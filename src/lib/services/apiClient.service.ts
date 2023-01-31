import axios from 'redaxios';

// TODO: Fix timeout issue

export function createApiClient({ apiKey, baseUrl, walletAddress }: ApiClientOptions): ApiClient {
	let _userWalletAddress = walletAddress;

	const commonHeaders: any = {
		'Content-Type': 'application/json',
	};

	const httpClient = axios.create({
		baseURL: baseUrl,
		headers: commonHeaders,
		withCredentials: true, // send cookies,
		// fetch: fetchWithTimeout(10000),
	});

	const setWalletAddress = (addr: string) => _userWalletAddress = addr;

	async function createApiKey() {
		const { data } = await httpClient.post<{ apiKey: string }>('/apikeys');
		return data;
	}

	async function getApiKeys(limit = 10) {
		const { data } = await httpClient.get<ApiKeyResponse[]>('/apikeys', { params: { limit } });
		return data;
	}

	async function validateApiKey(keyId: string) {
		const { data } = await httpClient.post<{ Status: string }>(`/apikeys/${keyId}/approve`);
		return data;
	}

	async function requestLogin(walletAddress: string) {
		setWalletAddress(walletAddress);
		try {
			const headers = { 'X-Api-Key': apiKey };
			const { data } = await httpClient.get<{ nonce: string }>(`/login`, { params: { walletAddress: _userWalletAddress }, headers });
			return data;
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function createUser(nonce: string, signature: string, visitor?: VisitorData) {
		const headers = { 'X-Api-Key': apiKey };
		const body = {
			nonce,
			signature,
			fingerprint: visitor
		};

		try {
			const { data } = await httpClient.post<{ authToken: AuthToken, user: User }>(`/users`, body, { headers });
			return data;
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function updateUser(userId: string, update: UserUpdate) {
		const request = () => httpClient.put<User>(`/users/${userId}`, update, {
			headers: { 'X-Api-Key': apiKey },
		});

		const { data } = await authInterceptor<{ data: User }>(request);
		return data;
	}

	async function requestEmailVerification(userId: string, email: string) {
		try {
			const request = () => httpClient.get(`/users/${userId}/verify-email`, {
				headers: { 'X-Api-Key': apiKey },
				params: { email },
				// timeout: 15 * 60 * 1000 // 15 minutes
			});

			await authInterceptor(request);
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function loginUser(nonce: string, signature: string, visitor?: VisitorData) {
		const headers = { 'X-Api-Key': apiKey };
		const body = {
			nonce,
			signature,
			fingerprint: visitor
		};

		try {
			const { data } = await httpClient.post<{ authToken: AuthToken, user: User }>(`/login/sign`, body, { headers });
			return data;
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function refreshToken(walletAddress: string) {
		const headers = { 'X-Api-Key': apiKey };
		try {
			const { data } = await httpClient.post<{ authToken: AuthToken, user: User }>(`/login/refresh`, { walletAddress }, { headers });
			console.log(' - Token was refreshed')
			return data;
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function logoutUser() {
		const headers = { 'X-Api-Key': apiKey };
		try {
			const { status } = await httpClient.post(`/login/logout`, {}, { headers });
			if (status === 204) return;
			else throw new Error("logout failed");
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function getUserStatus(userId: string) {
		if (!userId) throw new Error("userId is required");
		const headers = { 'X-Api-Key': apiKey };
		try {
			const request = () => httpClient.get(`/users/${userId}/status`, { headers });
			const { data } = await authInterceptor<{ data: { status: string } }>(request);
			return data;
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function getQuote(payload: QuoteRequestPayload) {
		const headers = { 'X-Api-Key': apiKey };
		try {
			const request = () => httpClient.post(`/quotes`, payload, { headers });
			const { data } = await authInterceptor<{ data: TransactPayload }>(request);
			return data;
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function transact(transactPayload: TransactPayload) {
		const headers = { 'X-Api-Key': apiKey };
		try {
			const request = () => httpClient.post(`/transactions`, transactPayload, { headers });
			const { data } = await authInterceptor<{ data: TransactionResponse }>(request);
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
			if (e.status === 401 && e.data?.code === 'MISSING_TOKEN' || e.data?.code === 'TOKEN_EXPIRED') {
				const data = await refreshToken(_userWalletAddress);
				if (data) {
					// request again
					return request();
				}
			}
			throw e;
		}
	}

	return {
		createApiKey,
		getApiKeys,
		validateApiKey,
		requestLogin,
		createUser,
		updateUser,
		requestEmailVerification,
		loginUser,
		refreshToken,
		logoutUser,
		getUserStatus,
		getQuote,
		transact,
		setWalletAddress
	};
}

export interface ApiClient {
	createApiKey: () => Promise<{ apiKey: string }>;
	getApiKeys: () => Promise<ApiKeyResponse[]>;
	validateApiKey: (keyId: string) => Promise<{ Status: string }>;
	requestLogin: (walletAddress: string) => Promise<{ nonce: string }>;
	createUser: (nonce: string, signature: string, visitor?: VisitorData) => Promise<{ authToken: AuthToken, user: User }>;
	updateUser: (userId: string, userUpdate: UserUpdate) => Promise<User>;
	requestEmailVerification: (userId: string, email: string) => Promise<void>;
	loginUser: (nonce: string, signature: string, visitor?: VisitorData) => Promise<{ authToken: AuthToken, user: User }>;
	refreshToken: (walletAddress: string) => Promise<{ authToken: AuthToken, user: User }>;
	logoutUser: () => Promise<void>;
	getUserStatus: (userId: string) => Promise<{ status: string }>;
	getQuote: (payload: QuoteRequestPayload) => Promise<TransactPayload>;
	transact: (quote: TransactPayload) => Promise<TransactionResponse>;
	setWalletAddress: (walletAddress: string) => void;
}

interface ApiKeyResponse {
	id: string;
	status: string;
	authType: string;
	data: string;
	createdAt: string;
	updatedAt: string;
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

interface UserUpdate {
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

export interface Quote {
	timestamp: number;
	baseUSD: number;
	gasUSD: number;
	tokenUSD: number;
	serviceUSD: number;
	totalUSD: number;
	signature: string;
}

export interface TransactPayload extends Quote {
	userAddress: string;
	chainID: number;
	contractAddress: string;
	contractFunction: string;
	contractReturn: string;
	contractParameters: string[];
	txValue: string;
	gasLimit: string;
	cardToken: string;
}

export interface TransactionResponse {
	txID: string;
	txUrl: string;
}

export interface QuoteRequestPayload {
	chainID: number;
	userAddress: string;
	contractAddress: string;
	contractFunction: string;
	contractReturn: string,
	contractParameters: string[];
	txValue: string;
	gasLimit: string;
}

export interface ApiClientOptions {
	apiKey: string;
	baseUrl: string;
	walletAddress: string;
}
