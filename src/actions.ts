import type { Config, StringPay, StringIframe, ExecutionRequest, Quote, TransactionRequest, StringPayload, User, IframeStyle } from "./types";
import type { Services } from "./services/index";

export function createStringPay(iframe: StringIframe, config: Config, services: Services): StringPay {
    const events = services.events;

    const DEFAULT_GAS_LIMIT = "800000";

    async function loadIframe(payload: StringPayload) {
        return iframe.load(payload);
    }

    async function setStyle(style: IframeStyle) {
        return iframe.setStyle(style);
    }

    async function authorizeUser(): Promise<User> {
        const walletAddress = await services.wallet.getWalletAddress();
        if (!walletAddress) {
            throw new Error("Wallet address not found");
        }

        return services.auth.authorizeUser(walletAddress);
    }

    async function updateUserName(userId: string, firstName: string, lastName: string) {
        const update = {firstName, lastName}
        return services.apiClient.updateUser(userId, update)
    }

    async function verifyEmail(userId: string, email: string) {
        return services.auth.emailVerification(userId, email);
    }

    async function verifyDevice() {
        const walletAddress = await services.wallet.getWalletAddress();
        return services.auth.deviceVerification(walletAddress);
    }

    async function getQuote(payload: StringPayload): Promise<Quote> {
        const executionRequest = <ExecutionRequest>payload;
        executionRequest.gasLimit = executionRequest.gasLimit || DEFAULT_GAS_LIMIT;

        return services.quote.getQuote(executionRequest);
    }

    /**
     * Notify the payment iframe to submit the card details
     * @returns {Promise<string>} - A promise that resolves to the card token
     */
    async function submitCard() {
        return new Promise<string>((resolve, reject) => {
            iframe.submitCard();

            events.once(events.CARD_TOKENIZED, (token: string) => {
                return resolve(token);
            });

            events.once(events.CARD_TOKENIZE_FAILED, (error) => {
                return reject(error);
            });
        });
    }

    async function getSavedCards() {
        return services.apiClient.getSavedCards();
    }

    async function submitTransaction(request: TransactionRequest) {
        return services.apiClient.transact(request);
    }

    function subscribeToQuote(payload: StringPayload, callback: (quote: Quote) => void) {
        const executionRequest = <ExecutionRequest>payload;
        executionRequest.gasLimit = executionRequest.gasLimit || DEFAULT_GAS_LIMIT;

        services.quote.startQuote(executionRequest, callback);
    }

    function unsubscribeFromQuote() {
        services.quote.stopQuote();
    }

    function subscribeTo(eventName: string, callback: (data: any) => void) {
        events.on(eventName, callback);
    }

    function unsubscribeFrom(eventName: string, callback: (data: any) => void) {
        events.unsubscribeFrom(eventName, callback);
    }

    return {
        loadIframe,
        authorizeUser,
        updateUserName,
        verifyEmail,
        verifyDevice,
        getQuote,
        subscribeToQuote,
        unsubscribeFromQuote,
        subscribeTo,
        unsubscribeFrom,
        submitCard,
        getSavedCards,
        submitTransaction,
        setStyle,
    };
}
