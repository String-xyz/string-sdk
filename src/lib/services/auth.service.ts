import type { ApiClient, User } from './apiClient.service';
import type { LocationService, VisitorData } from './location.service';

export function createAuthService({ apiClient, locationService, bypassDeviceCheck }: AuthServiceParams): AuthService {
	const previousAttempt = { signature: "", nonce: "" };

	const login = async (nonce: string, signature: string, visitorData?: VisitorData) => {
		const data = await apiClient.loginUser(nonce, signature, visitorData, bypassDeviceCheck);
		return data;
	};

	const loginOrCreateUser = async (walletAddress: string) => {
		const { nonce } = await apiClient.requestLogin(walletAddress);
		const signature = await requestSignature(walletAddress, nonce);
		const visitorData = await locationService.getVisitorData();

		// is there a better way to do this? I'm concerned about keeping this state in memory and not in local storage
		previousAttempt.nonce = nonce;
		previousAttempt.signature = signature;

		try {
			const data = await apiClient.createUser(nonce, signature, visitorData);
			return data;
		} catch (err: any) {
			// if user already exists, try to login
			if (err.code === "CONFLICT") return login(nonce, signature, visitorData);
			throw err;
		}
	};

	const logout = async () => {
		try {
			await apiClient.logoutUser();
		} catch {
			return;
		}
	}

	const getPreviousLogin = async () => {
		// TODO: Use refresh token instead
		// TODO: Modify refresh token endpoint to verify visitor data
		if (!previousAttempt.signature) throw { code: "UNAUTHORIZED" };

		const visitorData = await locationService.getVisitorData();

		if (!visitorData) throw new Error("cannot get device data");

		return { nonce: previousAttempt.nonce, signature: previousAttempt.signature, visitor: visitorData}  
	};


	/** 
	 * Prompts the user to sign a message using their wallet
	 * @param userAddress - The user's wallet address
	 * @param encodedMessage - The nonce encoded in base64
	 * @returns The signature of the message
	 */
	const requestSignature = async (userAddress: string, encodedMessage: string) => {
		try {
			const message = window.atob(encodedMessage);
			const signature = await window.ethereum.request({
				method: 'personal_sign',
				params: [message, userAddress],
			});

			return signature;
		} catch (error) {
			console.log("SDK :: Wallet signature error: ", error);
		}
	}

	const fetchLoggedInUser = async (walletAddress: string) => {
		try {
			const { user } = await apiClient.refreshToken(walletAddress);
			return user;
		} catch (err: any) {
			return null;
		}
	}

	return {
		loginOrCreateUser,
		fetchLoggedInUser,
		requestSignature,
		getPreviousLogin,
		logout
	};
}

export interface AuthServiceParams {
	apiClient: ApiClient;
	locationService: LocationService;
	bypassDeviceCheck: boolean;
}

export interface AuthService {
	loginOrCreateUser: (walletAddress: string) => Promise<{ user: User }>;
	fetchLoggedInUser: (walletAddress: string) => Promise<User | null>;
	requestSignature: (userAddress: string, encodedMessage: string) => Promise<string>;
	getPreviousLogin: () => Promise<{nonce: string, signature: string, visitor: VisitorData}>;
	logout: () => Promise<any>;
}