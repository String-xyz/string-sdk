import axios from 'axios';

// TODO: Fix timeout issue
// TODO: Fix interceptor issue

export function createApiClient(): ApiClient {
	const baseUrl = 'http://localhost:4040/'// import.meta.env.VITE_API_BASE_PATH;
	let _apiKey = '';
	let _walletAddress = '';

	const commonHeaders: any = {
		'Content-Type': 'application/json',
	};

	const httpClient = axios.create({
		baseURL: baseUrl,
		headers: commonHeaders,
		withCredentials: true, // send cookies,
		// fetch: fetchWithTimeout(10000),
	});

	function setApiKey(key: string) {
		_apiKey = key;
	}

	// this is not ideal, temporary solution until we migrate this file to the sdk
	function setWalletAddress(address: string) {
		_walletAddress = address;
	}

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
		const headers = { 'X-Api-Key': _apiKey };
		const { data } = await httpClient.get<{ nonce: string }>(`/login`, { params: { walletAddress }, headers });
		return data;
	}

	async function createUser(nonce: string, signature: string, visitor: VisitorData) {
		const headers = { 'X-Api-Key': _apiKey };
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
			console.log("createUser error:", error);
			throw error;
		}
	}

	async function updateUser(userId: string, update: UserUpdate) {
		const { data } = await httpClient.put<User>(`/users/${userId}`, update, {
			headers: { 'X-Api-Key': _apiKey },
		});
		return data;
	}

	async function requestEmailVerification(userId: string, email: string) {
		try {
			const { data } = await httpClient.get(`/users/${userId}/verify-email`, {
				headers: { 'X-Api-Key': _apiKey },
				params: { email },
				// timeout: 15 * 60 * 1000 // 15 minutes
			});
			return data;
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			throw error;
		}
	}

	async function loginUser(nonce: string, signature: string, visitor: VisitorData) {
		const headers = { 'X-Api-Key': _apiKey };
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
			console.log("loginUser error:", error);
			throw error;
		}
	}

	async function refreshToken() {
		const headers = { 'X-Api-Key': _apiKey };
		try {
			const { data } = await httpClient.post<AuthToken>(`/login/refresh`, { walletAddress: _walletAddress }, { headers });
			console.log(' - Token was refreshed')
			return data;
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			console.log("refreshToken error:", error);
			throw error;
		}
	}

	// logout
	async function logoutUser() {
		const headers = { 'X-Api-Key': _apiKey };
		try {
			const { status } = await httpClient.post(`/login/logout`, {}, { headers });
			if (status === 204) return;
			else throw new Error("logout failed");
		} catch (e: any) {
			const error = _getErrorFromAxiosError(e);
			console.log("logoutUser error:", error);
			throw error;
		}
	}

	async function getUserStatus(userId: string) {
		if (!userId) throw new Error("userId is required");
		const headers = { 'X-Api-Key': _apiKey };
		try {
			const { data } = await httpClient.get<{ status: string, emailStatus: string }>(`/users/${userId}/status`, { headers });
			return data;
		} catch (e: any) {
			console.error("getUserStatus error:", _getErrorFromAxiosError(e));
			throw e;
		}
	}

	async function getQuote(contractPayload: ContractPayload) {
		const headers = { 'X-Api-Key': _apiKey };
		try {
			const { data } = await httpClient.post<Promise<TransactPayload>>(`/quotes`, contractPayload, { headers });
			console.log("getQuote data:", data);
			return data;
		} catch (e: any) {
			console.error("getQuote error:", _getErrorFromAxiosError(e));
			throw e;
		}
	};

	async function transact(transactPayload: TransactPayload) {
		const headers = { 'X-Api-Key': _apiKey };
		try {
			const { data } = await httpClient.post<TransactionResponse>(`/transactions`, transactPayload, { headers });
			console.log("transact data:", data);
			return data;
		} catch (e: any) {
			console.error("transact error:", _getErrorFromAxiosError(e));
			throw e;
		}
	}

	function _getErrorFromAxiosError(e: any) {
		if (e.response) return e.response.data;
		else if (e.request) return e.request;
		else return e.message;
	}

	// TODO: Create a Request interceptor to add the X-Api-Key header to every request
	// httpClient.interceptors.request.use(
	// 	async (config: any) => {
	// 		if (!_apiKey) {
	// 			console.error('---- 1 ::::::: No API key set');
	// 			return Promise.reject('No API key set');
	// 		}

	// 		config.headers['X-Api-Key'] = _apiKey;
	// 		return config;
	// 	},
	// 	error => {
	// 		console.error('---- 2 ::::::: No API key set');
	// 		return Promise.reject(error);
	// 	}
	// );

	// Response interceptor to refresh the access token. Every time a request is made, the interceptor will check if the access token is expired.
	// If it is, it will try to refresh the token, and then retry the original request.
	// httpClient.interceptors.response.use(
	// 	response => response,
	// 	async error => {
	// 		// TODO: once this is migrated to the sdk, make sure there is a wallet connection before refreshing the token
	// 		if (!error.response || !error.response.data) return Promise.reject(error);

	// 		if (error.response.status === 401 && error.response.data?.code === 'TOKEN_EXPIRED' || error.response.data?.code === 'MISSING_TOKEN') {
	// 			console.log('------- refreshing token....')
	// 			const originalRequest = error.config;
	// 			try {
	// 				const data = await refreshToken();

	// 				// update the access token in the userStore
	// 				// retry the original request with the new access token
	// 				originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
	// 				return httpClient(originalRequest);
	// 			} catch (e: any) {
	// 				console.error("refresh token error:", _getErrorFromAxiosError(e));
	// 				// TODO: logout user. For now, just throw the error
	// 				return Promise.reject(error);
	// 			}
	// 		}

	// 		return Promise.reject(error);
	// 	});

	return {
		setApiKey,
		setWalletAddress,
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
	};
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

export interface ContractPayload {
	chainID: number;
	userAddress: string;
	contractAddress: string;
	contractFunction: string;
	contractReturn: string,
	contractParameters: string[];
	txValue: string;
	gasLimit: string;
}

export interface ApiClient {
	setApiKey: (apiKey: string) => void;
	setWalletAddress: (address: string) => void;
	createApiKey: () => Promise<{ apiKey: string }>;
	getApiKeys: () => Promise<ApiKeyResponse[]>;
	validateApiKey: (keyId: string) => Promise<{ Status: string }>;
	requestLogin: (walletAddress: string) => Promise<{ nonce: string }>;
	createUser: (nonce: string, signature: string, visitor: VisitorData) => Promise<{ authToken: AuthToken, user: User }>;
	updateUser: (userId: string, userUpdate: UserUpdate) => Promise<User>;
	requestEmailVerification: (userId: string, email: string) => Promise<void>;
	loginUser: (nonce: string, signature: string, visitor: VisitorData) => Promise<{ authToken: AuthToken, user: User }>;
	refreshToken: () => Promise<AuthToken>;
	logoutUser: () => Promise<void>;
	getUserStatus: (userId: string) => Promise<{ status: string, emailStatus: string }>;
	getQuote: (contractPayload: ContractPayload) => Promise<TransactPayload>;
	transact: (quote: TransactPayload) => Promise<TransactionResponse>;
}


// const fetchWithTimeout =
// 	(timeoutMs: number) =>
// 		(input: RequestInfo, init?: RequestInit): Promise<Response> => {
// 			return fetch(input, {
// 				...init,
// 				signal: abortFetchSignal(timeoutMs),
// 			})
// 		}

// const abortFetchSignal = (timeoutMs: number) => {
// 	if (typeof window === 'undefined' || window.AbortController === undefined) {
// 		return undefined
// 	}

// 	const abortController = new AbortController()
// 	setTimeout(() => abortController.abort(), timeoutMs)

// 	return abortController.signal
// }