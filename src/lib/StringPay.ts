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

const IFRAME_URL = import.meta.env.VITE_IFRAME_URL

const err = (msg: string) => {
	console.error("[String Pay] " + msg)
}

const userAddr = import.meta.env.VITE_TEST_ADDRESS ?? "0x000000"

export const testPayload: StringPayload = {
	name: "String Demo NFT",
	collection: "String Demo",
	imageSrc: "https://gateway.pinata.cloud/ipfs/bafybeibtmy26mac47n5pp6srds76h74riqs76erw24p5yvdhmwu7pxlcx4/STR_Logo_1.png",
	imageAlt: "NFT",
	currency: "AVAX",
	price: 0.08,
	chainID: 43113,
	userAddress: userAddr,
	contractAddress: "0x41e11ff9f71f51800f67cb913ea6bc59d3f126aa",
	contractABI: ['function getOwnedIDs(address owner) view returns (uint256[])', 'function tokenURI(uint256 tokenId) view returns (string)'],
	contractFunction: 'mintTo',
	contractParameters: [userAddr],
	txValue: (0.08 * 1e18).toString()
}

export class StringPay {
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

		if (!IFRAME_URL) {
			err("IFRAME_URL not specified")
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

