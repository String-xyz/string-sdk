import type { AuthService, AuthServiceParams, User, UserUpdate } from "../types";

export function createAuthService({ apiClient, locationService, bypassDeviceCheck }: AuthServiceParams): AuthService {
    let deviceCheckInterval: NodeJS.Timer | undefined;
    const previousAttempt = { signature: "", nonce: "" };

    const authorizeUser = async (walletAddress: string): Promise<User> => {
        const { nonce } = await apiClient.requestLogin(walletAddress);
        const signature = await requestSignature(walletAddress, nonce);
        const visitorData = await locationService.getVisitorData();

        // is there a better way to do this? I'm concerned about keeping this state in memory and not in local storage
        previousAttempt.nonce = nonce;
        previousAttempt.signature = signature;

        try {
            const { user } = await apiClient.createUser(nonce, signature, visitorData);
            return user;
        } catch (err: any) {
            // if user already exists, try to login
            if (err.code === "CONFLICT") {
                const { user } = await apiClient.loginUser(nonce, signature, visitorData, bypassDeviceCheck);
                return user;
            }
            throw err;
        }
    };

    const getPreviousSignature = async () => {
        // TODO: Use refresh token instead
        // TODO: Modify refresh token endpoint to verify visitor data
        if (!previousAttempt.signature) throw { code: "UNAUTHORIZED" };

        const visitorData = await locationService.getVisitorData();

        if (!visitorData) throw new Error("cannot get device data");

        return { nonce: previousAttempt.nonce, signature: previousAttempt.signature, visitor: visitorData };
    };

    /**
     * Prompts the user to sign a message using their wallet
     * @param userAddress - The user's wallet address
     * @param encodedMessage - The nonce encoded in base64
     * @returns The signature of the message
     */
    // TODO: Move to the wallet service
    const requestSignature = async (userAddress: string, encodedMessage: string) => {
        try {
            const message = window.atob(encodedMessage);
            const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [message, userAddress],
            });

            return signature;
        } catch (error) {
            console.error("SDK :: Wallet signature error: ", error);
        }
    };

    const fetchLoggedInUser = async (walletAddress: string) => {
        try {
            const { user } = await apiClient.refreshToken(walletAddress);
            return user;
        } catch (e: any) {
            return null;
        }
    };

    const emailVerification = async (userId: string, email: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            apiClient
                .requestEmailVerification(userId, email)
                .then(() => {
                    const emailCheckInterval = setInterval(async () => {
                        const { status } = await apiClient.getUserStatus(userId);
                        if (status == "email_verified") {
                            clearInterval(emailCheckInterval);
                            return resolve();
                        }
                    }, 5000);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    };

    const emailPreview = (walletAddress: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            getPreviousSignature()
                .then((previous) => {
                    let nonce = previous.nonce;
                    let signature = previous.signature;

                    if (!previous.signature) {
                        apiClient
                            .requestLogin(walletAddress)
                            .then((loginResponse) => {
                                nonce = loginResponse.nonce;
                                requestSignature(walletAddress, nonce)
                                    .then((newSignature) => {
                                        signature = newSignature;
                                        apiClient
                                            .getUserEmailPreview(nonce, signature)
                                            .then((response) => {
                                                resolve(response.email);
                                            })
                                            .catch(reject);
                                    })
                                    .catch(reject);
                            })
                            .catch(reject);
                    } else {
                        apiClient
                            .getUserEmailPreview(nonce, signature)
                            .then((response) => {
                                resolve(response.email);
                            })
                            .catch(reject);
                    }
                })
                .catch(reject);
        });
    };

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
                    return status;
                }
            }, 5000);
        } catch (error: any) {
            return error;
        }
    };

    const updateUser = async (userId: string, userUpdate: UserUpdate) => {
        try {
            await apiClient.updateUser(userId, userUpdate);
        } catch (err: any) {
            return err;
        }
    };

    const logout = async () => {
        try {
            await apiClient.logoutUser();
        } catch (err: any) {
            return err;
        }
    };

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
    };
}
