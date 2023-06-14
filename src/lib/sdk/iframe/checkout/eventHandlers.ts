import type { Services } from "$lib/sdk/services";
import type { ExecutionRequest, Quote, TransactionRequest, UserUpdate } from "$lib/sdk/services/apiClient.service";
import type { Config } from "../../config";
import type { EventHandlers, IframeEvent, IframeEventSender } from "../common";
import { createCheckoutIframePayload } from "./utils";

export function createEventHandlers(iframeElement: HTMLIFrameElement, eventSender: IframeEventSender, config: Config, services: Services): EventHandlers {
    const send = eventSender.sendEvent;
    const events = services.events;

    const eventToHandlersMap: EventHandlers = {
        ready: onIframeReady,
        close: onIframeClose,
        resize: onIframeResize,
        authorize_user: onAuthorizeUser,
        update_user: onUpdateUser,
        email_verification: onEmailVerification,
        email_preview: onEmailPreview,
        device_verification: onDeviceVerification,
        saved_cards: onRequestSavedCards,
        get_quote: onGetQuote,
        confirm_transaction: onConfirmTransaction,
    };

    async function onIframeReady(reqEvent: IframeEvent): Promise<IframeEvent> {
        console.log(">> Ready event: ", reqEvent);

        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const user = await services.auth.fetchLoggedInUser(config.payload.userAddress);
            const iframePayload = createCheckoutIframePayload(config.payload, user);

            // stringPay.isLoaded = true;
            events.propagate(events.IFRAME_LOADED, "string-payment-iframe");

            resEvent.data = iframePayload;
        } catch (e: any) {
            resEvent.error = e;
        }

        return send(resEvent);
    }

    async function onIframeClose(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            services.quote.stopQuote();
        } catch (e: any) {
            resEvent.error = e;
        }

        return send(resEvent);
    }

    async function onIframeResize(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        if (reqEvent.data?.height != iframeElement.scrollHeight) {
            iframeElement.style.height = (reqEvent.data?.height ?? iframeElement.scrollHeight) + "px";
        }

        return send(resEvent);
    }

    async function onAuthorizeUser(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const { user } = await services.auth.authorizeUser(config.payload.userAddress);

            resEvent.data = user;
        } catch (e: any) {
            resEvent.error = e;
        }

        return send(resEvent);
    }

    async function onUpdateUser(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const data = <{ userId: string; update: UserUpdate }>reqEvent.data;
            const user = await services.auth.updateUser(data.userId, data.update);

            resEvent.data = user;
        } catch (e: any) {
            resEvent.error = e;
        }

        return send(resEvent);
    }

    async function onEmailVerification(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const data = <{ userId: string; email: string }>resEvent.data;
            const status = await services.auth.emailVerification(data.userId, data.email);

            resEvent.data = status;
        } catch (error: any) {
            resEvent.error = error;
        }

        return send(resEvent);
    }

    async function onDeviceVerification(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const data = <{ walletAddress: string }>reqEvent.data;
            const status = await services.auth.deviceVerification(data.walletAddress);

            resEvent.data = status;
        } catch (e: any) {
            resEvent.error = e;
        }

        return send(resEvent);
    }

    async function onEmailPreview(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const data = <{ walletAddress: string }>reqEvent.data;
            const email = await services.auth.emailPreview(data.walletAddress);

            resEvent.data = email;
        } catch (e: any) {
            resEvent.error = e;
        }

        return send(resEvent);
    }

    async function onRequestSavedCards(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const cards = await services.apiClient.getSavedCards();

            resEvent.data = cards;
        } catch (e: any) {
            resEvent.error = e;
        }

        return send(resEvent);
    }

    async function onGetQuote(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const quotePayload = <ExecutionRequest>config.payload;
            const quote = await services.apiClient.getQuote(quotePayload);

            resEvent.data = quote;
        } catch (e: any) {
            resEvent.error = e;
        }

        return send(resEvent);
    }

    async function onConfirmTransaction(reqEvent: IframeEvent) {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        try {
            const data = <TransactionRequest>reqEvent.data;

            const txRes = await services.apiClient.transact(data);
            resEvent.data = txRes;

            // propagate event to the service layer
            services.events.propagate(services.events.TX_SUCCESS, txRes);
        } catch (e: any) {
            resEvent.error = e;
            services.events.propagate(services.events.TX_ERROR, e);
        }

        return send(resEvent);
    }

    return eventToHandlersMap;
}
