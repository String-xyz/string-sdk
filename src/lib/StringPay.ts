import { registerEvents } from '$lib/events';

export interface StringPayload {
	name: string;
	collection: string;
	currency: string;
	price: number;
	imageSrc: string;
	imageAlt?: string;
	chainID: number;
	userAddress: string;
	contractAddress: string;
	contractABI: string[],
	contractFunction: string;
	contractParameters: string[];
	txValue: string;
}

export interface StringInitArgs {
	apiKey: string
}

import { PUBLIC_IFRAME_URL } from '$env/static/public';

const err = (msg: string) => {
	console.error("[String Pay] " + msg)
}

class StringPay {
	#apiKey?: string;
	container?: Element;
	frame?: HTMLIFrameElement;
	payload?: StringPayload;
	isLoaded = false;

	init(args: StringInitArgs) {
		if (!args?.apiKey) {
			err("Invalid String API key passed to init function")
			return;
		}

		this.#apiKey = args?.apiKey;
	}
	loadFrame(payload: StringPayload) {
		if (!this.#apiKey) {
			err("You must initialize with your API key first");
			return;
		}
		
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
			err("No payload specified")
			return;
		}

		this.payload = payload;

		registerEvents();

		const iframe = document.createElement('iframe');
		iframe.style.width = "374px";
		iframe.style.height = "700px";

		iframe.src = PUBLIC_IFRAME_URL;
		container.appendChild(iframe);
		this.frame = iframe;
	}
}

export default new StringPay();

