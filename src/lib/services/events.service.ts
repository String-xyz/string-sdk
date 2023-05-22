import type { StringPay, StringPayload } from "../StringPay";
import type { ApiClient, ExecutionRequest, TransactionRequest, Quote, PaymentInfo, User, UserUpdate } from "./apiClient.service";
import type { LocationService } from "./location.service";
import type { QuoteService } from "./quote.service";
import type { AuthService } from "./auth.service";

const CHANNEL = "STRING_PAY";

export enum Events {
    LOAD_PAYLOAD                = "load_payload",
    IFRAME_READY                = "ready",
    IFRAME_RESIZE               = "resize",
    IFRAME_CLOSE                = "close",
    REQUEST_AUTHORIZE_USER      = "request_authorize_user",
    RECEIVE_AUTHORIZE_USER      = "receive_authorize_user",
    REQUEST_RETRY_LOGIN         = "request_retry_login",
    RECEIVE_RETRY_LOGIN         = "receive_retry_login",
    REQUEST_UPDATE_USER         = 'request_update_user',
    RECEIVE_UPDATE_USER         = 'receive_update_user',
    REQUEST_EMAIL_VERIFICATION  = "request_email_verification",
    RECEIVE_EMAIL_VERIFICATION  = "receive_email_verification",
    REQUEST_EMAIL_PREVIEW       = "request_email_preview",
    RECEIVE_EMAIL_PREVIEW       = "receive_email_preview",
    REQUEST_CONFIRM_TRANSACTION = "request_confirm_transaction",
    RECEIVE_CONFIRM_TRANSACTION = "receive_confirm_transaction",
    REQUEST_QUOTE_START         = "request_quote_start",
    QUOTE_CHANGED               = "quote_changed",
    REQUEST_QUOTE_STOP          = "request_quote_stop",
}

const eventHandlers: Record<string, (event: StringEvent, stringPay: StringPay) => void> = {};

export function createEventsService(iframeUrl: string, authService: AuthService, quoteService: QuoteService, apiClient: ApiClient, locationService: LocationService) {
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

    const _handleEvent = async (e: any) => {
        if (e.origin !== iframeUrl) return;

        try {
            const payload = JSON.parse(e.data);
            const channel = payload.channel;
            const event = <StringEvent>payload.event;
            if (channel === CHANNEL) {
                const handler = eventHandlers[event.eventName];
                if (handler) await handler(event, window.StringPay);
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
        const stringPay = window.StringPay;

        if (stringPay) {
            stringPay.frame?.remove();
            stringPay.frame = undefined;
            stringPay.isLoaded = false;
            if (stringPay.onFrameClose) stringPay.onFrameClose();
        }
    }

    // Hook event handlers to the events
    eventHandlers[Events.IFRAME_READY]                = onIframeReady;
    eventHandlers[Events.IFRAME_CLOSE]                = onIframeClose;
    eventHandlers[Events.IFRAME_RESIZE]               = onIframeResize;
    eventHandlers[Events.REQUEST_AUTHORIZE_USER]      = onAuthorizeUser;
    eventHandlers[Events.REQUEST_RETRY_LOGIN]         = onRetryLogin;
    eventHandlers[Events.REQUEST_UPDATE_USER]         = onUpdateUser;
    eventHandlers[Events.REQUEST_EMAIL_VERIFICATION]  = onEmailVerification;
    eventHandlers[Events.REQUEST_EMAIL_PREVIEW]       = onEmailPreview;
    eventHandlers[Events.REQUEST_QUOTE_START]         = onQuoteStart;
    eventHandlers[Events.REQUEST_QUOTE_STOP]          = onQuoteStop;
    eventHandlers[Events.REQUEST_CONFIRM_TRANSACTION] = onConfirmTransaction;

    /** -------------- EVENT HANDLERS  ---------------- */

    async function onIframeReady(event: StringEvent, stringPay: StringPay) {
        let user = null as User | null;

        if (!stringPay.frame || !stringPay.payload) throw new Error("Iframe not ready");

        apiClient.setWalletAddress(stringPay.payload.userAddress);

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

        if (stringPay.onFrameLoad) stringPay.onFrameLoad();
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
            const check = setInterval(async () => {
                const { status } = await apiClient.getUserStatus(data.userId);
                if (status == "email_verified") {
                    sendEvent(frame, Events.RECEIVE_EMAIL_VERIFICATION, { status });
                    clearInterval(check);
                }
            }, 5000);
        } catch (error: any) {
            sendEvent(frame, Events.RECEIVE_EMAIL_VERIFICATION, {}, error);
        }
    }

    async function onEmailPreview(event: StringEvent, { frame }: StringPay) {
        if (!frame) throw new Error("Iframe not ready");

        try {
            const data = <{ walletAddress: string }>event.data;

            const { nonce } = await apiClient.requestLogin(data.walletAddress);
            const signature = await authService.requestSignature(data.walletAddress, nonce);

            const { email } = await apiClient.getUserEmailPreview(nonce, signature);

            sendEvent(frame, Events.RECEIVE_EMAIL_PREVIEW, { email });
        } catch (error: any) {
            sendEvent(frame, Events.RECEIVE_EMAIL_PREVIEW, {}, error);
        }
    }

    async function onQuoteStart(event: StringEvent, { frame, payload }: StringPay) {
        if (!frame) throw new Error("Iframe not ready");

        const quotePayload = <TransactionRequest>payload;

        const callback = (quote: Quote | null, err: any) => sendEvent(frame, Events.QUOTE_CHANGED, { quote, err });
        quoteService.startQuote(quotePayload, callback);
    }

    async function onQuoteStop() {
        quoteService.stopQuote();
    }

    async function onConfirmTransaction(event: StringEvent, stringPay: StringPay) {
        if (!stringPay.frame) throw new Error("Iframe not ready");

        try {
            const paymentInfo = <PaymentInfo>{};
            paymentInfo.cardToken = event.data.cardToken;

            const data = <ExecutionRequest>event.data;
            data.paymentInfo = paymentInfo;

            const txRes = await apiClient.transact(data);
            sendEvent(stringPay.frame, Events.RECEIVE_CONFIRM_TRANSACTION, txRes);

            if (stringPay.onTxSuccess && stringPay.payload) {
                stringPay.onTxSuccess(stringPay.payload, txRes);
            }
        } catch (error: any) {
            sendEvent(stringPay.frame, Events.RECEIVE_CONFIRM_TRANSACTION, {}, error);
            if (stringPay.onTxError && stringPay.payload) {
                stringPay.onTxError(stringPay.payload, error);
            }
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
        assetName: payload.assetName,
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
    assetName: string;
    price: string;
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
