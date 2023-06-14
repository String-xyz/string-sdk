import type { Config } from "./config";
import type { StringIframe } from "./iframe/common";
import type { Services } from "./services";
import type { ExecutionRequest, Quote } from "./services/apiClient.service";

export interface StringPayActions {
    authorizeUser(): Promise<void>;
    submitCard(): Promise<void>;
    getQuote(): Promise<void>;
    subscribeToQuote(callback: (quote: Quote) => void): void;
    unsubscribeFromQuote(callback: (quote: Quote) => void): void;
    subscribeTo: (eventName: string, callback: (event: any) => void) => void;
    unsubscribeFrom: (eventName: string, callback: (event: any) => void) => void;
    setStyle(style: any): Promise<void>;
}

export function createActions(iframe: StringIframe, config: Config, services: Services): StringPayActions {
    const events = services.events;

    async function authorizeUser() {
        const walletAddress = await services.wallet.getWalletAddress();
        return services.auth.authorizeUser(walletAddress);
    }

    /**
     * Notify the payment iframe to submit the card details
     */
    async function submitCard() {
        // return new Promise<string>((resolve, reject) => {
        iframe.submitCard();

        // events.once(events.CARD_TOKENIZED, (token: string) => {
        //     return resolve(token);
        // });

        // events.once(events.CARD_TOKENIZE_FAILED, (error) => {
        //     return reject(error);
        // });
        // });
    }

    async function setStyle(style: any) {
        iframe.setStyle(style);
    }

    async function getQuote() {
        const payload = <ExecutionRequest>config.payload;
        services.quote.getQuote(payload);
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

    function unsubscribeFrom(eventName: string) {
        // TODOX
        // events.off(eventName);
    }

    return {
        authorizeUser,
        getQuote,
        subscribeToQuote,
        unsubscribeFromQuote,
        subscribeTo,
        unsubscribeFrom,
        submitCard,
        setStyle,
    };
}
