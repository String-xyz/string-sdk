import { Services } from "../../services";
import type { Config, IframeStyle, StringIframe } from "../../types";
import { createIframeEventListener, createIframeEventSender } from "../common/index";
import { createEventHandlers } from "./eventHandlers";

export function createPaymentIframe(config: Config, services: Services): StringIframe {
    const eventChannel = "STRING_PAY";

    const container = document.querySelector(".string-payment-frame");
    const element = document.createElement("iframe");
    element.style.width = "100vh";
    element.style.height = "900px";
    element.style.overflow = "none";

    /* An iframe to sdk events protocol is composed of 3 components:
     * sender: send events to the iframe
     * handlers: handle events from the iframe
     * listeners: receive iframe events and map them to handler functions
     *  */
    const eventSender = createIframeEventSender(eventChannel, element);
    const handlers = createEventHandlers(eventSender, services);
    const eventListener = createIframeEventListener(eventChannel, element, handlers);

    function load(): HTMLIFrameElement {
        if (!container) throw new Error("Unable to load String Frame, element 'string-pay-frame' does not exist");

        // Clear out any existing children
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        eventListener.startListening();

        element.src = config.paymentIframeUrl;

        container.appendChild(element);

        return element;
    }

    function destroy() {
        if (!container) throw new Error("Unable to load String Frame, element 'string-pay-frame' does not exist");

        // Clear out any existing children
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (eventListener) eventListener.stopListening();
    }

    async function submitCard() {
        eventSender.sendData("submit_card", {});
    }

    async function setStyle(style: IframeStyle) {
        eventSender.sendData("set_style", style);
    }

    return {
        load,
        destroy,
        submitCard,
        setStyle,
    };
}
