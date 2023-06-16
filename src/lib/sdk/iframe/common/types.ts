/**
 * @param {IframeEvent} reqEvent The event request from the iframe
 * @returns {IframeEvent} The response event to be sent
 */
export type Handler = (reqEvent: IframeEvent) => Promise<IframeEvent>;

export type EventHandlers = Record<string, Handler>;

export interface IframeEvent<T = any> {
    eventName: string;
    data?: T;
    error?: any;
}

export interface StringIframe {
    load: () => HTMLIFrameElement;
    destroy: () => void;
    submitCard: () => Promise<void>;
    setStyle: (style: string) => void;
}
