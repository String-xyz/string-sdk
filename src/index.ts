import { UserOptions, StringPay } from "./types";
import { createServices } from "./services";
import { createIframe } from "./iframe";
import { createStringPay } from "./actions";
import { createConfig } from "./config";

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

    const actions = createStringPay(iframe, config, services);

    return actions;
}

export type * from "./config";
