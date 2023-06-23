import type { Config, StringPay, StringIframe, ExecutionRequest, Quote, TransactionRequest } from "@src/types";
import type { Services } from "./services/index";

export function createStringPay(iframe: StringIframe, config: Config, services: Services): StringPay {
    const events = services.events;

    async function loadIframe() {
        return iframe.load();
    }

    async function setStyle(style: any) {
        iframe.setStyle(style);
    }

    async function authorizeUser(): Promise<User> {
        const walletAddress = await services.wallet.getWalletAddress();
        if (!walletAddress) {
            throw new Error("Wallet address not found");
        }

        return (await services.auth.authorizeUser(walletAddress)).user;
    }

    async function verifyEmail(userId: string, email: string) {
        return services.auth.emailVerification(userId, email);
    }

    async function verifyDevice() {
        const walletAddress = await services.wallet.getWalletAddress();
        return services.auth.deviceVerification(walletAddress);
    }

    async function getQuote(): Promise<Quote> {
        const payload = <ExecutionRequest>config.payload;
        return services.quote.getQuote(payload);
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

    async function submitTransaction(request: TransactionRequest) {
        return services.apiClient.transact(request);
    }

    function subscribeToQuote(callback: (quote: Quote) => void) {
        const payload = <ExecutionRequest>config.payload;
        services.quote.startQuote(payload, callback);
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
        verifyEmail,
        verifyDevice,
        getQuote,
        subscribeToQuote,
        unsubscribeFromQuote,
        subscribeTo,
        unsubscribeFrom,
        submitCard,
        submitTransaction,
        setStyle,
    };
}
