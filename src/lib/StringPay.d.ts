export interface StringPayload {
    options?: StringOptions;
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

export interface StringOptions {
    bypassDeviceCheck?: boolean;
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
