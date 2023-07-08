import { Config, DefaultConfig, Environment, UserOptions } from "./types";
const commonConfig = {
    bypassDeviceCheck: BYPASS_DEVICE_CHECK,
    analyticsSubdomainUrl: ANALYTICS_SUBDOMAIN_URL,
    analyticsPublicKey: ANALYTICS_LIB_PK,
};

const defaultConfigs: Record<Environment, DefaultConfig> = {
    PROD: {
        ...commonConfig,
        apiUrl: PROD_API_URL,
        checkoutIframeUrl: PROD_CHECKOUT_IFRAME_URL,
        paymentIframeUrl: PROD_DIRECT_IFRAME_URL,
    },
    SANDBOX: {
        ...commonConfig,
        apiUrl: SBOX_API_URL,
        checkoutIframeUrl: SBOX_CHECKOUT_IFRAME_URL,
        paymentIframeUrl: SBOX_DIRECT_IFRAME_URL,
    },
    DEV: {
        ...commonConfig,
        apiUrl: DEV_API_URL,
        checkoutIframeUrl: DEV_CHECKOUT_IFRAME_URL,
        paymentIframeUrl: DEV_DIRECT_IFRAME_URL,
    },
    LOCAL: {
        ...commonConfig,
        apiUrl: LOCAL_API_URL,
        checkoutIframeUrl: LOCAL_CHECKOUT_IFRAME_URL,
        paymentIframeUrl: LOCAL_DIRECT_IFRAME_URL,
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
