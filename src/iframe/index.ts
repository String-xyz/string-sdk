import type { Config, StringIframe, Services } from "@src/types";
import { createCheckoutIframe } from "./checkout";
import { createPaymentIframe } from "./payment";

export function createIframe(config: Config, services: Services): StringIframe {
    const checkoutIframeElement = document.querySelector(".string-checkout-frame");
    const paymentIframeElement = document.querySelector(".string-payment-frame");

    if (!checkoutIframeElement && !paymentIframeElement) throw new Error(".string-checkout-frame or .string-payment-frame has not been found id dom");

    if (checkoutIframeElement) {
        const stringIframe = createCheckoutIframe(config, services);
        return stringIframe;
    }

    const stringIframe = createPaymentIframe(config, services);
    return stringIframe;
}

export type * from "./checkout";
