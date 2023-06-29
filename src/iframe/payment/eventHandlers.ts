import type { VisitorData, EventHandlers, IframeEvent, IframeEventSender } from "../../types";
import type { Services } from "../../services";

export function createEventHandlers(eventSender: IframeEventSender, services: Services): EventHandlers {
    const send = eventSender.sendEvent;
    const events = services.events;

    const eventToHandlersMap: EventHandlers = {
        iframe_loaded: onIframeLoaded,
        card_tokenized: onCardTokenized,
        fingerprint: onFingerprint,
        card_tokenize_failed: onCardTokenizeFailed,
        card_vendor_changed: onCardVendorChanged,
        card_validation_changed: onCardValidationChanged,
    };

    async function onIframeLoaded(reqEvent: IframeEvent): Promise<IframeEvent> {
        const resEvent: IframeEvent = { eventName: "res_" + reqEvent.eventName };

        events.propagate(events.IFRAME_LOADED, "string-payment-iframe");
        return send(resEvent);
    }

    async function onFingerprint(reqEvent: IframeEvent) {
        const visitorData = <VisitorData>reqEvent.data;
        services.location.setCachedVisitorData(visitorData);
        return send({ eventName: "res_" + reqEvent.eventName });
    }

    async function onCardTokenized(reqEvent: IframeEvent) {
        events.propagate(events.CARD_TOKENIZED, reqEvent.data);
        return send({ eventName: "res_" + reqEvent.eventName });
    }

    async function onCardTokenizeFailed(reqEvent: IframeEvent) {
        events.propagate(events.CARD_TOKENIZE_FAILED, reqEvent.data);
        return send({ eventName: "res_" + reqEvent.eventName });
    }

    async function onCardVendorChanged(reqEvent: IframeEvent) {
        console.log("SDK: Validation changed: ", reqEvent);
        events.propagate(events.CARD_VENDOR_CHANGED, reqEvent.data);
        return send({ eventName: "res_" + reqEvent.eventName });
    }

    async function onCardValidationChanged(reqEvent: IframeEvent) {
        console.log("--- Card validation changed", reqEvent);
        events.propagate(events.CARD_VALIDATION_CHANGED, reqEvent.data);
        return send({ eventName: "res_" + reqEvent.eventName });
    }

    return eventToHandlersMap;
}
