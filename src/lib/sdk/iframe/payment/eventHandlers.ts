import type { Services } from "$lib/sdk/services";
import type { Config } from "../../config";
import type { EventHandlers, IframeEvent, IframeEventSender } from "../common";

export function createEventHandlers(eventSender: IframeEventSender, config: Config, services: Services): EventHandlers {
    const send = eventSender.sendEvent;
    const events = services.events;

    const eventToHandlersMap: EventHandlers = {
        iframe_loaded: onIframeLoaded,
        card_tokenized: onCardTokenized,
        // fingerprint: onFingerprint,
        // iframe_ready: onIframeReady,
        // card_submitted: onCardSubmitted,
        // card_tokenize_failed: onCardTokenizeFailed,
        // card_vendor_changed: onCardVendorChanged,
        // card_validation_changed: onCardValidationChanged,
    };

    async function onIframeLoaded(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        console.log(">>>> Payment Iframe loaded");
        // stringPay.isLoaded = true;
        events.propagate(events.IFRAME_LOADED, "string-payment-iframe");
        return send(resEvent);
    }

    async function onCardTokenized(reqEvent: IframeEvent): Promise<IframeEvent> {
        events.propagate(events.CARD_TOKENIZED, reqEvent.data);
        return send(resEvent);
    }

    return eventToHandlersMap;
}
