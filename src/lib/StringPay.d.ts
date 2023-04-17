export interface StringPayload {
    assetName: string;
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

export declare class StringPay {
	isLoaded: boolean;
	payload?: StringPayload;
	frame?: HTMLIFrameElement;
	container?: Element;
	onFrameLoad: () => void;
	onFrameClose: () => void;
	init(options: StringOptions): void;
	loadFrame(payload: StringPayload): void;
}
