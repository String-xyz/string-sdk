import { registerEvents } from '$lib/events';

export interface StringPayload {
	apiKey: string;
	name: string;
	collection: string;
	currency: string;
	price: number;
	imageSrc: string;
	imageAlt?: string;
	chainID: number;
	userAddress: string;
	contractAddress: string;
	contractFunction: string;
	contractReturn: string,
	contractParameters: string[];
	txValue: string;
}

const IFRAME_URL = import.meta.env.VITE_IFRAME_URL

const err = (msg: string) => {
	console.error("[String Pay] " + msg)
}

export class StringPay {
	container?: Element;
	frame?: HTMLIFrameElement;
	payload?: StringPayload;
	isLoaded = false;
	onframeload = () => {};
	onframeclose = () => {};
	loadFrame(payload: StringPayload) {
		const container = document.querySelector(".string-pay-frame");
		if (!container) {
			err("Unable to load String Frame, element 'string-pay-frame' does not exist");
			return;
		}

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		this.container = container;

		if (!payload) {
			err("No payload specified");
			return;
		}

		if (!payload.apiKey) {
			err("You must have an api key in your payload");
			return;
		}

		if (payload.apiKey.slice(0, 4) !== "str.") {
			err(`Invalid API Key: ${payload.apiKey}`);
			return;
		}

		if (!IFRAME_URL) {
			err("IFRAME_URL not specified");
			return;
		}

		this.payload = payload;

		registerEvents();

		const iframe = document.createElement('iframe');
		iframe.style.width = "100vh";
		iframe.style.height = "700px";
		iframe.style.overflow = "none";

		iframe.src = IFRAME_URL;
		container.appendChild(iframe);
		this.frame = iframe;
	}
}

(<any>window).StringPay = new StringPay()

