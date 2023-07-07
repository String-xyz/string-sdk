import { Services } from "../services";
import type { Config, StringIframe } from "../types";
import { createCheckoutIframe } from "./checkout";
import { createPaymentIframe } from "./payment";

export function createIframe(config: Config, services: Services, styles?: string): StringIframe {
    const checkoutIframeElement = document.querySelector(".string-checkout-frame");
    const paymentIframeElement = document.querySelector(".string-payment-frame");

    if (!checkoutIframeElement && !paymentIframeElement) throw new Error("Neither .string-checkout-frame nor .string-payment-frame has been found in the DOM");

    if (checkoutIframeElement) {
        const stringIframe = createCheckoutIframe(config, services);
        return stringIframe;
    }

    const stringIframe = createPaymentIframe(config, services, styles);
    return stringIframe;
}

export type * from "./checkout";
