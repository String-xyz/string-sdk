import type { Config, IframeEventListener, StringIframe } from "../../types";
import type { Services } from "../../services";
import { createIframeEventListener, createIframeEventSender } from "../common/index";
import { createEventHandlers } from "./eventHandlers";
import { StringPayload } from "../../types";

export function createCheckoutIframe(config: Config, services: Services): StringIframe {
    const eventChannel = "string-checkout-frame";
    let eventListener: IframeEventListener | undefined;

    const container = document.querySelector(".string-checkout-frame");
    const iframeElement = document.createElement("iframe");
    iframeElement.style.width = "100vh";
    iframeElement.style.height = "900px";
    iframeElement.style.overflow = "none";
    iframeElement.src = config.checkoutIframeUrl;

    const eventSender = createIframeEventSender(eventChannel, iframeElement);

    function load(payload: StringPayload): HTMLIFrameElement {
        if (!container) throw new Error("Unable to load String Frame, element 'string-pay-frame' does not exist");

        // Clear out any existing children
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        container.appendChild(iframeElement);

        _initEvents(payload);

        return iframeElement;
    }

    function destroy() {
        if (!container) throw new Error("Unable to load String Frame, element 'string-pay-frame' does not exist");

        // Clear out any existing children
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (eventListener) eventListener.stopListening();
    }

    function _initEvents(payload: StringPayload) {
        /* a iframe to sdk events protocol is composed of 3 components:
         * sender: send events to the iframe
         * handlers: handle events from the iframe
         * listeners: receive iframe events and map them to handler functions
         *  */
        const handlers = createEventHandlers(iframeElement, eventSender, config, payload, services);
        const listener = createIframeEventListener(eventChannel, iframeElement, handlers);
        listener.startListening();

        eventListener = listener;
    }

    return {
        load,
        destroy,
        submitCard: async () => {},
        setStyle: async () => {},
    };
}
