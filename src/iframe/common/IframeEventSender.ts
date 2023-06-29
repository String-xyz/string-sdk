import type { IframeEvent, IframeEventSender } from "../../types";

export function createIframeEventSender(channel: string, frame: HTMLIFrameElement): IframeEventSender {
    /* ---------------------------------------------------------------- */

    function sendData<T = any>(eventName: string, data: T) {
        const event: IframeEvent = { eventName, data };
        return sendEvent(event);
    }

    function sendError(eventName: string, error: any) {
        const event: IframeEvent = { eventName, error };
        return sendEvent(event);
    }

    function sendEvent(event: IframeEvent) {
        const message = JSON.stringify({
            channel,
            data: event,
        });

        frame.contentWindow?.postMessage(message, "*");

        return event;
    }

    return {
        sendData,
        sendError,
        sendEvent,
    };
}
