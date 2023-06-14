import { createConfig, type UserOptions } from "./config";
import { createServices } from "$lib/sdk/services";
import { createIframe } from "./iframe";
import { createActions, type StringPayActions } from "./actions";

export function init(options: UserOptions): StringPay {
    const config = createConfig(options);

    // run some checks
    if (!options.apiKeyPublic || !options.apiKeyPublic.startsWith("str.")) throw new Error("Invalid or missing API Key");

    const services = createServices(config);

    if (!config.bypassDeviceCheck) {
        // if enabled, init location service as soon as possible
        services.location.getFPInstance().catch((e) => console.debug("getFPInstance error: ", e));
    }

    const iframe = createIframe(config, services);
    const actions = createActions(iframe, config, services);

    return {
        ...actions,
        loadIframe: iframe.load,
    };
}

export interface StringPay extends StringPayActions {
    loadIframe: () => HTMLIFrameElement;
}

export type * from "./config";
