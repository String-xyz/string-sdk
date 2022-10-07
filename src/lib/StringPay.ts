import { registerEvents, sendEvent, Events } from '$lib/events';

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

const PUBLIC_IFRAME_URL = "http://localhost:4040"

const err = (msg: string) => {
	console.error("[String Pay] " + msg)
}

let apikey: string;
let frame: HTMLIFrameElement;
let payload: StringPayload;


export const StringPay = {
	init: (args: any) => {
		if (!args?.apiKey) {
			err("Invalid String API Key passed to init function")
			return;
		}

		apikey = args?.apiKey;
	},
	loadFrame: (_payload: StringPayload) => {
		if (!apikey) {
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

		if (!_payload) {
			err("No payload specified")
			return;
		}

		payload = _payload


		registerEvents();

		const iframe = document.createElement('iframe');
		iframe.style.width = "100vw";
		iframe.style.height = "100vh";

		iframe.src = PUBLIC_IFRAME_URL;
		container.appendChild(iframe);
		frame = iframe;

		frame.onload = () => {
			container.setAttribute("data-loaded", "true")
			sendEvent(frame, Events.INIT, payload);
		}
	},
}

// window.StringPay = StringPay;


