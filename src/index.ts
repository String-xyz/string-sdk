import { UserOptions, StringPay, IframeStyle } from "./types";
import { createServices } from "./services";
import { createIframe } from "./iframe";
import { createStringPay } from "./actions";
import { createConfig } from "./config";

export function init(options: UserOptions): StringPay {
    const config = createConfig(options);

    // run some checks
    if (!options.apiKey || !options.apiKey.startsWith("str.")) throw new Error("Invalid or missing API Key");

    const services = createServices(config);

    if (!config.bypassDeviceCheck) {
        // if enabled, init location service as soon as possible
        services.location.getFPInstance().catch((e) => console.debug("getFPInstance error: ", e));
    }

    // If the user has passed a style, fail fast if it's invalid
    let styles: IframeStyle | string | undefined = options.setStyle;
    if (styles) {
        try {
            styles = encodeURIComponent(JSON.stringify(styles));
        } catch (e) {
            console.error("Invalid String iframe style object");
            styles = undefined;
        }
    }

    const iframe = createIframe(config, services, styles);

    const actions = createStringPay(iframe, config, services);

    return actions;
}

export type * from "./config";
