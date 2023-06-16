import type { IframeEvent } from "./types";

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

export interface IframeEventSender {
    sendData<T = any>(eventName: string, data: T): IframeEvent; // returns the event sent
    sendError(eventName: string, error: any): IframeEvent; // returns the event sent
    sendEvent(event: IframeEvent): IframeEvent; // returns the event sent
}
