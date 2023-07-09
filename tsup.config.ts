import { defineConfig } from "tsup";
import dotenv from "dotenv";
dotenv.config();


export default defineConfig((options) => {
    return {
        entry: ["src/index.ts"],
        sourcemap: false,
        dts: true,
        splitting: false,
        clean: !options.watch,
        format: ["cjs", "esm"],
        minify: !options.watch,
        env: {
            ANALYTICS_LIB_PK: process.env.ANALYTICS_LIB_PK || "",
            ANALYTICS_SUBDOMAIN_URL: process.env.ANALYTICS_SUBDOMAIN_URL || "",
            LOCAL_CHECKOUT_IFRAME_URL: process.env.LOCAL_IFRAME_URL || "",
            LOCAL_DIRECT_IFRAME_URL: process.env.LOCAL_DIRECT_IFRAME_URL  || "",
            LOCAL_API_URL: process.env.LOCAL_API_URL || "",
            PROD_CHECKOUT_IFRAME_URL: process.env.PROD_CHECKOUT_IFRAME_URL || "",
            PROD_DIRECT_IFRAME_URL: process.env.PROD_DIRECT_IFRAME_URL || "",
            PROD_API_URL: process.env.PROD_API_URL || "",
            SBOX_CHECKOUT_IFRAME_URL: process.env.SBOX_CHECKOUT_IFRAME_URL || "",
            SBOX_DIRECT_IFRAME_URL: process.env.SBOX_DIRECT_IFRAME_URL || "",
            SBOX_API_URL: process.env.SBOX_API_URL || "",
            DEV_CHECKOUT_IFRAME_URL: process.env.DEV_CHECKOUT_IFRAME_URL || "",
            DEV_DIRECT_IFRAME_URL: process.env.DEV_DIRECT_IFRAME_URL || "",
            DEV_API_URL: process.env.DEV_API_URL || "",
            IPFS_GATEWAY: process.env.IPFS_GATEWAY || "",
            IPFS_CID: process.env.IPFS_CID || "",
            STRING_API_KEY: process.env.STRING_API_KEY || "",
            BYPASS_DEVICE_CHECK: process.env.BYPASS_DEVICE_CHECK || "",
        },
        // Internal packages not meant for client consumption should be here
        noExternal: [],
    };
});