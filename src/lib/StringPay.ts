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

const userAddr = import.meta.env.VITE_TEST_ADDRESS ?? "0x000000"
const apiKey = import.meta.env.VITE_STRING_API_KEY

export const testPayload: StringPayload = {
	apiKey,
	name: "String Demo NFT",
	collection: "String Demo",
	imageSrc: "https://gateway.pinata.cloud/ipfs/bafybeibtmy26mac47n5pp6srds76h74riqs76erw24p5yvdhmwu7pxlcx4/STR_Logo_1.png",
	imageAlt: "NFT",
	currency: "AVAX",
	price: 0.08,
	chainID: 43113,
	userAddress: userAddr,
	contractAddress: "0x41e11ff9f71f51800f67cb913ea6bc59d3f126aa",
	contractFunction: "mintTo(address)",
	contractReturn: "uint256",
	contractParameters: [userAddr],
	txValue: "0.08 eth",
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
		iframe.style.width = "100%";
		iframe.style.height = "700px";
		iframe.style.overflow = "none";

		iframe.src = IFRAME_URL;
		container.appendChild(iframe);
		this.frame = iframe;
	}
}

(<any>window).StringPay = new StringPay()

