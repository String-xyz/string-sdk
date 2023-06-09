import type { ApiClient, User,  UserUpdate } from "./apiClient.service";
import type { LocationService, VisitorData } from './location.service';

export function createAuthService({ apiClient, locationService, bypassDeviceCheck }: AuthServiceParams): AuthService {
	let emailCheckInterval: NodeJS.Timer | undefined;
    let deviceCheckInterval: NodeJS.Timer | undefined;
    const previousAttempt = { signature: "", nonce: "" };

    const authorizeUser = async (walletAddress: string) => {
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
			if (err.code === "CONFLICT") return apiClient.loginUser(nonce, signature, visitorData, bypassDeviceCheck);
			throw err;
		}
	};

    const getPreviousSignature = async () => {
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
		} catch (err) {
			console.log("SDK :: Wallet signature error: ", err);
			throw err;
		}
	}

	const fetchLoggedInUser = async (walletAddress: string) => {
		try {
			const { user } = await apiClient.refreshToken(walletAddress);
			return user;
		} catch (err) {
			throw err;
		}
	}

    const emailVerification = async (userId: string, email: string) => {
        try {
            await apiClient.requestEmailVerification(userId, email);
            
            clearInterval(emailCheckInterval);
            emailCheckInterval = setInterval(async () => {
                const { status } = await apiClient.getUserStatus(userId);
                if (status == "email_verified") {
                    clearInterval(emailCheckInterval);
                    return status
                }
            }, 5000);
        } catch  (err){
            throw err
        }
    }

    const emailPreview = async (walletAddress: string) => {
        try {
            let nonce: string;
            let signature: string;

            const previous = await getPreviousSignature();
            nonce = previous.nonce;
            signature = previous.signature;

            if (!previous.signature) {
                nonce = (await apiClient.requestLogin(walletAddress)).nonce;
                signature = await requestSignature(walletAddress, nonce);
            }

            const { email } = await apiClient.getUserEmailPreview(nonce, signature);
            return email;

        }
        catch (err) {
            throw err
        }
    }

    const deviceVerification = async (walletAddress: string) => {
        try {
            let nonce: string;
            let signature: string;
    
            const previous = await getPreviousSignature();
            nonce = previous.nonce;
            signature = previous.signature;

            if (!previous.signature) {
                nonce = (await apiClient.requestLogin(walletAddress)).nonce;
                signature = await requestSignature(walletAddress, nonce);
            }
    
            await apiClient.requestDeviceVerification(nonce, signature, previous.visitor);

            clearInterval(deviceCheckInterval);
            deviceCheckInterval = setInterval(async () => {
                const { status } = await apiClient.getDeviceStatus(nonce, signature, previous.visitor);
                if (status == "verified") {
                    clearInterval(deviceCheckInterval);
                    return status
                }
            }, 5000);
        } catch (err) {
            throw err;
        }
    }

    const updateUser = async (userId: string, userUpdate: UserUpdate) => {
        try {
            return await apiClient.updateUser(userId, userUpdate);
        } catch (err) {
            throw err;
        }
    }

    const logout = async () => {
		try {
			await apiClient.logoutUser();
		} catch (err) {
			throw err;
		}
	}

    const cleanup = () => {
        clearInterval(emailCheckInterval);
        clearInterval(deviceCheckInterval);
    }

	return {
        authorizeUser,
        emailVerification,
        emailPreview,
        deviceVerification,
        fetchLoggedInUser,
		requestSignature,
		getPreviousSignature,
        updateUser,
        logout,
        cleanup
    };
}

export interface AuthService {
	authorizeUser: (walletAddress: string) => Promise<any>;
    fetchLoggedInUser: (walletAddress: string) => Promise<User | null>;
	requestSignature: (userAddress: string, encodedMessage: string) => Promise<string>;
	getPreviousSignature: () => Promise<{nonce: string, signature: string, visitor: VisitorData}>;
    emailVerification: (userId: string, email: string) => Promise<any>;
    emailPreview: (walletAddress: string) => Promise<any>;
    deviceVerification: (walletAddress: string) => Promise<any>;
    updateUser: (userId: string, userUpdate: UserUpdate) => Promise<User>;
    logout: () => Promise<void>;
    cleanup: () => void;
}

export interface AuthServiceParams {
	apiClient: ApiClient;
	locationService: LocationService;
	bypassDeviceCheck: boolean;
}