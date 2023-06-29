import type { IframeEvent, EventHandlers, IframeEventListener } from "@src/types";

export function createIframeEventListener(channel: string, frame: HTMLIFrameElement, handlers: EventHandlers): IframeEventListener {
    async function startListening() {
        stopListening(); // first remove previous listeners to prevent duplicates

        window.addEventListener("message", _handleEvent);
    }

    async function stopListening() {
        window.removeEventListener("message", _handleEvent);
    }

    async function _handleEvent(e: any) {
        if (new URL(e.origin).host !== new URL(frame.src).host) return;

        try {
            const payload = JSON.parse(e.data);
            if (payload.channel === channel) {
                const event = <IframeEvent>payload.data;
                const handler = handlers[event.eventName];

                if (handler) await handler(event);
                else console.debug("SDK :: Unhandled event: ", event);
            }
        } catch (error) {
            console.error("string-sdk: error handling event: ", error);
        }
    }

    return {
        startListening,
        stopListening,
    };
}
