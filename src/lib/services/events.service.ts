import type { StringPay, StringPayload } from "../StringPay";
import type { ApiClient, QuoteRequestPayload, TransactPayload, User, UserUpdate } from "./apiClient.service";
import type { AuthService } from "./auth.service";
import type { LocationService } from "./location.service";
import type { QuoteService } from "./quote.service";

const CHANNEL = "STRING_PAY";
const IFRAME_URL = new URL(import.meta.env.VITE_IFRAME_URL).origin;

export enum Events {
    LOAD_PAYLOAD = "load_payload",
    IFRAME_READY = "ready",
    IFRAME_RESIZE = "resize",
    IFRAME_CLOSE = "close",
    REQUEST_AUTHORIZE_USER = "request_authorize_user",
    RECEIVE_AUTHORIZE_USER = "receive_authorize_user",
    REQUEST_RETRY_LOGIN = "request_retry_login",
    RECEIVE_RETRY_LOGIN = "receive_retry_login",
    REQUEST_UPDATE_USER = 'request_update_user',
    RECEIVE_UPDATE_USER = 'receive_update_user',
    REQUEST_EMAIL_VERIFICATION = "request_email_verification",
    RECEIVE_EMAIL_VERIFICATION = "receive_email_verification",
    REQUEST_CONFIRM_TRANSACTION = "request_confirm_transaction",
    RECEIVE_CONFIRM_TRANSACTION = "receive_confirm_transaction",
    REQUEST_QUOTE_START = "request_quote_start",
    QUOTE_CHANGED = "quote_changed",
    REQUEST_QUOTE_STOP = "request_quote_stop",
}

const eventHandlers: Record<string, (event: StringEvent, stringPay: StringPay) => void> = {};

const _handleEvent = async (e: any) => {
    if (e.origin !== IFRAME_URL) return;

    const stringPay: StringPay = (<any>window).StringPay;

    try {
        const payload = JSON.parse(e.data);
        const channel = payload.channel;
        const event = <StringEvent>payload.event;
        if (channel === CHANNEL) {
            const handler = eventHandlers[event.eventName];
            if (handler) await handler(event, stringPay);
            else console.debug("SDK :: Unhandled event: ", event);
        }
    } catch (error) {
        console.error("sdk: _handleEvent error: ", error);
    }
};

const registerEvents = () => {
    unregisterEvents();

    window.addEventListener("message", _handleEvent);
};

const unregisterEvents = () => {
    window.removeEventListener("message", _handleEvent);
};

function cleanup() {
    unregisterEvents();

    if ((<any>window).StringPay) {
        (<any>window).StringPay.frame?.remove();
        (<any>window).StringPay.frame = undefined;
        (<any>window).StringPay.isLoaded = false;
        (<any>window).StringPay.onFrameClose();
    }
}

export function createEventsService(authService: AuthService, quoteService: QuoteService, apiClient: ApiClient, locationService: LocationService) {
    const sendEvent = <T = any>(frame: HTMLIFrameElement, eventName: string, data?: T, error?: any) => {
        if (!frame) {
            err("a frame was not provided to sendEvent");
        }

        const stringEvent: StringEvent = { eventName, data, error };
        const message = JSON.stringify({
            channel: CHANNEL,
            event: stringEvent,
        });

        frame.contentWindow?.postMessage(message, "*");
    };

    //
    eventHandlers[Events.IFRAME_READY] = onIframeReady;
    eventHandlers[Events.IFRAME_CLOSE] = onIframeClose;
    eventHandlers[Events.IFRAME_RESIZE] = onIframeResize;
    eventHandlers[Events.REQUEST_AUTHORIZE_USER] = onAuthorizeUser;
    eventHandlers[Events.REQUEST_RETRY_LOGIN] = onRetryLogin;
    eventHandlers[Events.REQUEST_UPDATE_USER] = onUpdateUser;
    eventHandlers[Events.REQUEST_EMAIL_VERIFICATION] = onEmailVerification;
    eventHandlers[Events.REQUEST_QUOTE_START] = onQuoteStart;
    eventHandlers[Events.REQUEST_QUOTE_STOP] = onQuoteStop;
    eventHandlers[Events.REQUEST_CONFIRM_TRANSACTION] = onConfirmTransaction;

    /** -------------- EVENT HANDLERS  ---------------- */

    async function onIframeReady(event: StringEvent, stringPay: StringPay) {
        let user = null as User | null;

        if (!stringPay.frame || !stringPay.payload) throw new Error("Iframe not ready");

        apiClient.setWalletAddress(stringPay.payload.userAddress);
        apiClient.setApiKey(stringPay.payload.apiKey);

        // init fp service
        locationService.getFPInstance().catch((err) => console.debug("getFPInstance error: ", err));

        try {
            user = await authService.fetchLoggedInUser(stringPay.payload.userAddress);
        } catch (e) {
            console.debug("fetchLoggedInUser error", e);
        }

        const iframePayload = createIframePayload(stringPay.payload, user);
        sendEvent(stringPay.frame, Events.LOAD_PAYLOAD, iframePayload);
        stringPay.isLoaded = true;
        stringPay.onFrameLoad();
    }

    async function onIframeClose() {
        console.debug("SDK :: onIframeClose");
        quoteService.stopQuote();
        cleanup();
    }

    async function onIframeResize(event: StringEvent, stringPay: StringPay) {
        if (!stringPay.frame || !stringPay.payload) throw new Error("Iframe not ready");

        const frame = stringPay.frame;

        if (event.data?.height != frame.scrollHeight) {
            frame.style.height = (event.data?.height ?? frame.scrollHeight) + "px";
        }
    }

    async function onAuthorizeUser(event: StringEvent, stringPay: StringPay) {
        if (!stringPay.frame || !stringPay.payload) throw new Error("Iframe not ready");

        try {
            const { user } = await authService.loginOrCreateUser(stringPay.payload.userAddress);
            sendEvent(stringPay.frame, Events.RECEIVE_AUTHORIZE_USER, { user });
        } catch (error: any) {
            console.debug("SDK :: onAuthorizeUser error: ", error);
            sendEvent(stringPay.frame, Events.RECEIVE_AUTHORIZE_USER, {}, error);
        }
    }

    async function onRetryLogin(event: StringEvent, { frame }: StringPay) {
        if (!frame) throw new Error("Iframe not ready");

        try {
            const { user } = await authService.retryLogin();
            sendEvent(frame, Events.RECEIVE_RETRY_LOGIN, { user });
        } catch (error) {
            sendEvent(frame, Events.RECEIVE_RETRY_LOGIN, {}, error);
        }
    }

    async function onUpdateUser(event: StringEvent, { frame }: StringPay) {
        if (!frame) throw new Error("Iframe not ready");

        try {
            const data = <{ userId: string, update: UserUpdate }>event.data;
            const user = await apiClient.updateUser(data.userId, data.update);

            sendEvent(frame, Events.RECEIVE_UPDATE_USER, { user });
        } catch (error: any) {
            sendEvent(frame, Events.RECEIVE_UPDATE_USER, {}, error);
        }
    }

    async function onEmailVerification(event: StringEvent, { frame }: StringPay) {
        if (!frame) throw new Error("Iframe not ready");

        try {
            const data = <{ userId: string; email: string }>event.data;
            await apiClient.requestEmailVerification(data.userId, data.email);
            sendEvent(frame, Events.RECEIVE_EMAIL_VERIFICATION, {
                status: "email_verified",
            });
        } catch (error: any) {
            sendEvent(frame, Events.RECEIVE_EMAIL_VERIFICATION, {}, error);
        }
    }

    async function onQuoteStart(event: StringEvent, { frame, payload }: StringPay) {
        if (!frame) throw new Error("Iframe not ready");

        const quotePayload = <QuoteRequestPayload>payload;

        const callback = (quote: TransactPayload) => sendEvent(frame, Events.QUOTE_CHANGED, { quote });
        quoteService.startQuote(quotePayload, callback);
    }

    async function onQuoteStop() {
        quoteService.stopQuote();
    }

    async function onConfirmTransaction(event: StringEvent, { frame }: StringPay) {
        if (!frame) throw new Error("Iframe not ready");

        try {
            const data = <TransactPayload>event.data;
            const txHash = await apiClient.transact(data);
            sendEvent(frame, Events.RECEIVE_CONFIRM_TRANSACTION, txHash);
        } catch (error: any) {
            sendEvent(frame, Events.RECEIVE_CONFIRM_TRANSACTION, {}, error);
        }
    }

    // Subscribe to wallet change events
    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
        apiClient.setWalletAddress(accounts[0]);
        logout();
        cleanup();
        quoteService.stopQuote();
    });

    function logout() {
        apiClient.logoutUser();
    }

    return {
        registerEvents,
        unregisterEvents,
        sendEvent,
    };
}

// Parse payload before sending it to the iframe
function createIframePayload(payload: StringPayload, _user: User | null): IframePayload {
    const nft: NFT = {
        name: payload.name,
        price: payload.price,
        currency: payload.currency,
        collection: payload.collection ?? "",
        imageSrc: payload.imageSrc,
        imageAlt: payload?.imageAlt ?? "NFT",
    };

    return {
        nft,
        user: {
            walletAddress: payload.userAddress,
            id: _user?.id ?? "",
            status: _user?.status ?? "",
            email: _user?.email ?? "",
        },
    };
}

function err(msg: string) {
    console.error("[String Pay] " + msg);
}

export interface StringEvent {
    eventName: string;
    data?: any;
    error: string;
}

export interface NFT {
    name: string;
    price: number;
    currency: string;
    collection?: string;
    imageSrc: string;
    imageAlt?: string;
}

export interface IframePayload {
    nft: NFT;
    user: {
        id: string;
        walletAddress: string;
        status: string;
        email: string;
    };
}