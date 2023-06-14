const commonConfig = {
    bypassDeviceCheck: false,
    analyticsSubdomainUrl: "https://metrics.string.xyz",
    analyticsPublicKey: "",
};

const defaultConfigs: Record<Environment, DefaultConfig> = {
    PROD: {
        ...commonConfig,
        apiUrl: "https://api.string-api.xyz",
        checkoutIframeUrl: "https://iframe.string-api.xyz",
        paymentIframeUrl: "https://payment-iframe.string-api.xyz/?env=prod&appType=web",
    },
    SANDBOX: {
        ...commonConfig,
        apiUrl: "https://api.sandbox.string-api.xyz",
        checkoutIframeUrl: "https://iframe-app.dev.string-api.xyz",
        paymentIframeUrl: "https://payment-iframe.string-api.xyz/?env=dev&appType=web",
    },
    DEV: {
        ...commonConfig,
        apiUrl: "https://string-api.dev.string-api.xyz",
        checkoutIframeUrl: "https://iframe-app.dev.string-api.xyz",
        paymentIframeUrl: "https://payment-iframe.string-api.xyz/?env=dev&appType=web",
    },
    LOCAL: {
        ...commonConfig,
        apiUrl: "http://localhost:5555",
        checkoutIframeUrl: "http://localhost:4040",
        paymentIframeUrl: "http://localhost:4041",
    },
};

export function createConfig(options: UserOptions): Config {
    const defaultConfig = defaultConfigs[options.env];

    if (!defaultConfig) {
        throw new Error(`Invalid environment: ${options.env}`);
    }

    const config: Config = {
        ...defaultConfig,
        apiKeyPublic: options.apiKeyPublic,
        payload: options.payload,
        bypassDeviceCheck: options.bypassDeviceCheck || false,
    };

    if (!config.payload.gasLimit) {
        config.payload.gasLimit = "8000000";
    }

    return config;
}

export type DefaultConfig = {
    apiUrl: string;
    checkoutIframeUrl: string;
    paymentIframeUrl: string;
    bypassDeviceCheck: boolean;
};

export interface UserOptions {
    env: Environment;
    apiKeyPublic: string;
    bypassDeviceCheck?: boolean;
    payload: StringPayload;
}

/* Extended config with user options */
export interface Config extends DefaultConfig {
    apiKeyPublic: string;
    payload: StringPayload;
}

export interface StringPayload {
    assetName: string;
    collection?: string;
    price: string;
    currency: string;
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

export type Environment = "PROD" | "SANDBOX" | "DEV" | "LOCAL";
