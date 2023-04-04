import { createServices, type Services } from "./services";

export interface StringPayload {
    name: string;
    collection?: string;
    currency: string;
    price: number;
    imageSrc: string;
    imageAlt?: string;
    chainID: number;
    userAddress: string;
    contractAddress: string;
    contractFunction: string;
    contractReturn: string;
    contractParameters: string[];
    txValue: string;
    gasLimit?: string;
}

export type StringSDKEnvironment = "PROD" | "SANDBOX" | "DEV" | "LOCAL";

export interface StringOptions {
    env: StringSDKEnvironment;
    publicKey: string;
    bypassDeviceCheck?: boolean;
}

type StringEnvDetails = {
    IFRAME_URL: string;
    API_URL: string;
}

const ENV_TABLE: Record<StringSDKEnvironment, StringEnvDetails> = {
    "PROD": {
        IFRAME_URL: import.meta.env.PROD_IFRAME_URL,
        API_URL: import.meta.env.PROD_API_URL,
    },
    "SANDBOX": {
        IFRAME_URL: import.meta.env.SBOX_IFRAME_URL,
        API_URL: import.meta.env.SBOX_API_URL,
    },
    "DEV": {
        IFRAME_URL: import.meta.env.DEV_IFRAME_URL,
        API_URL: import.meta.env.DEV_API_URL,
    },
    "LOCAL": {
        IFRAME_URL: import.meta.env.LOCAL_IFRAME_URL,
        API_URL: import.meta.env.LOCAL_API_URL,
    }
}

const err = (msg: string) => {
    console.error("[String Pay] " + msg);
};

export class StringPay {
    isLoaded = false;
    payload?: StringPayload;
    frame?: HTMLIFrameElement;
    container?: Element;
    #services: Services;
    private _IFRAME_URL: string;

    onFrameLoad = () => {};
    onFrameClose = () => {};

    init(options: StringOptions) {
        const envDetails = ENV_TABLE[options.env];
        if (!envDetails) {
            return err(`Invalid environment: ${options.env}`);
        }

        if (!options.publicKey) return err("You need an API key to use the String SDK");
        if (options.publicKey.slice(0, 4) !== "str.") return err(`Invalid API Key: ${options.publicKey}`);

        this._IFRAME_URL = envDetails.IFRAME_URL;
        this.#services = createServices({
            baseUrl: envDetails.API_URL,
            iframeUrl: envDetails.IFRAME_URL,
            apiKey: options.publicKey,
            bypassDeviceCheck: options.bypassDeviceCheck ?? false
        });
    }

    async loadFrame(payload: StringPayload) {
        // make sure there is a wallet connected
        if (!window.ethereum || !window.ethereum.selectedAddress) return err("No wallet connected, please connect wallet");

        const container = document.querySelector(".string-pay-frame");
        if (!container) return err("Unable to load String Frame, element 'string-pay-frame' does not exist");

        // Clear out any existing children
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Validate payload
        if (!payload) return err("No payload specified");
        if (!payload.userAddress) return err("No user address found, please connect wallet");
        if (!this._IFRAME_URL) return err("IFRAME_URL not specified. Did you call init()?");
        if (!this.#services) return err("Services not initialized. Did you call init()?");

        // Set payload
        this.payload = payload;

        // Create iframe in dom
        const iframe = document.createElement("iframe");
        iframe.style.width = "100vh";
        iframe.style.height = "700px";
        iframe.style.overflow = "none";
        iframe.src = this._IFRAME_URL;

        container.appendChild(iframe);
        this.container = container;
        this.frame = iframe;

        // set the default gas limit
        this.payload.gasLimit = "8000000"; // TODO: Do we want this value to change dynamically?

        this.#services.eventsService.unregisterEvents();
        this.#services.eventsService.registerEvents();
    }
}

function main() {
    // Expose the StringPay instance to the window

    const stringPay = new StringPay();
    (<any>window).StringPay = stringPay;
}

main();
