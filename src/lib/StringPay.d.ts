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
}
export declare class StringPay {
	container?: Element;
	frame?: HTMLIFrameElement;
	payload?: StringPayload;
	isLoaded: boolean;
	onFrameLoad: () => void;
	onFrameClose: () => void;
	loadFrame(payload: StringPayload): void;
}
