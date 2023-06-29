import { Config, DefaultConfig, Environment, UserOptions } from "./types";

const commonConfig = {
    bypassDeviceCheck: false,
    analyticsSubdomainUrl: "https://metrics.string.xyz",
    analyticsPublicKey: "nmYB7RHc1vaGnBNRwtbe",
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
        apiUrl: "http://localhost:4444",
        checkoutIframeUrl: "http://localhost:4040",
        paymentIframeUrl: "http://localhost:4041?env=dev&appType=web",
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
