import { createServices, type Services } from "./services";

export interface StringPayload {
    apiKey: string;
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

const IFRAME_URL = import.meta.env.VITE_IFRAME_URL;
const API_URL = import.meta.env.VITE_API_URL;

const err = (msg: string) => {
    console.error("[String Pay] " + msg);
};

export class StringPay {
    container?: Element;
    frame?: HTMLIFrameElement;
    payload?: StringPayload;
    isLoaded = false;
    services: Services;
    private _loadIframeCallback = () => {};

    constructor(loadIframeCallback: () => void) {
        this._loadIframeCallback = loadIframeCallback;
    }

    onFrameLoad = () => {};
    onFrameClose = () => {};

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
        if (!payload.apiKey) return err("You must have an api key in your payload");
        if (payload.apiKey.slice(0, 4) !== "str.") return err(`Invalid API Key: ${payload.apiKey}`);
        if (!payload.userAddress) return err("No user address found, please connect wallet");
        if (!IFRAME_URL) return err("IFRAME_URL not specified");

        // Set payload
        this.payload = payload;

        // Create iframe in dom
        const iframe = document.createElement("iframe");
        iframe.style.width = "100vh";
        iframe.style.height = "700px";
        iframe.style.overflow = "none";
        iframe.src = IFRAME_URL;
        container.appendChild(iframe);
        this.container = container;
        this.frame = iframe;

        // set the default gas limit
        this.payload.gasLimit = "8000000"; // TODO: Do we want this value to change dynamically?

        this._loadIframeCallback();
    }
}

function main() {
    // This is the starting point of the library
    // We create services that contain all the logic for the library
    // StringPay is the main class that is exported to the user
    // We also create a callback that is called when the iframe is loaded. This is used to register events

    const services = createServices({
        apiUrl: API_URL,
    });

    const loadIframeCallback = () => {
        services.eventsService.unregisterEvents();
        services.eventsService.registerEvents();
    };

    const stringPay = new StringPay(loadIframeCallback);
    (<any>window).StringPay = stringPay;
}

main();
