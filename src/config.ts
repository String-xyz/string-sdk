import { Config, DefaultConfig, Environment, UserOptions } from "./types";

const commonConfig = {
    bypassDeviceCheck: process.env.BYPASS_DEVICE_CHECK === "true" ? true : false,
    analyticsSubdomainUrl: process.env.ANALYTICS_SUBDOMAIN_URL || "",
    analyticsPublicKey: process.env.ANALYTICS_LIB_PK || "",
};

const defaultConfigs: Record<Environment, DefaultConfig> = {
    PROD: {
        ...commonConfig,
        apiUrl: process.env.PROD_API_URL || "",
        checkoutIframeUrl: process.env.PROD_CHECKOUT_IFRAME_URL || "",
        paymentIframeUrl: process.env.PROD_DIRECT_IFRAME_URL || "",
    },
    SANDBOX: {
        ...commonConfig,
        apiUrl: process.env.SBOX_API_URL || "",
        checkoutIframeUrl: process.env.SBOX_CHECKOUT_IFRAME_URL || "",
        paymentIframeUrl: process.env.SBOX_DIRECT_IFRAME_URL || "",
    },
    DEV: {
        ...commonConfig,
        apiUrl: process.env.DEV_API_URL || "",
        checkoutIframeUrl: process.env.DEV_CHECKOUT_IFRAME_URL || "",
        paymentIframeUrl: process.env.DEV_DIRECT_IFRAME_URL || "",
    },
    LOCAL: {
        ...commonConfig,
        apiUrl: process.env.LOCAL_API_URL || "",
        checkoutIframeUrl: process.env.LOCAL_CHECKOUT_IFRAME_URL || "",
        paymentIframeUrl: process.env.LOCAL_DIRECT_IFRAME_URL || "",
    },
};

export function createConfig(options: UserOptions): Config {
    const defaultConfig = defaultConfigs[options.env];

    if (!defaultConfig) {
        throw new Error(`Invalid environment: ${options.env}`);
    }

    const config: Config = {
        ...defaultConfig,
        apiKey: options.apiKey,
        bypassDeviceCheck: options.bypassDeviceCheck || false,
    };

    return config;
}
