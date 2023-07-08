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
        define: {
            'ANALYTICS_LIB_PK': JSON.stringify(process.env.ANALYTICS_LIB_PK),
            'ANALYTICS_SUBDOMAIN_URL': JSON.stringify(process.env.ANALYTICS_SUBDOMAIN_URL),
            'LOCAL_IFRAME_URL': JSON.stringify(process.env.LOCAL_IFRAME_URL),
            'LOCAL_API_URL': JSON.stringify(process.env.LOCAL_API_URL),
            'PROD_CHECKOUT_IFRAME_URL': JSON.stringify(process.env.PROD_CHECKOUT_IFRAME_URL),
            'PROD_DIRECT_IFRAME_URL': JSON.stringify(process.env.PROD_DIRECT_IFRAME_URL),
            'PROD_API_URL': JSON.stringify(process.env.PROD_API_URL),
            'SBOX_IFRAME_URL': JSON.stringify(process.env.SBOX_IFRAME_URL),
            'SBOX_API_URL': JSON.stringify(process.env.SBOX_API_URL),
            'DEV_IFRAME_URL': JSON.stringify(process.env.DEV_IFRAME_URL),
            'DEV_API_URL': JSON.stringify(process.env.DEV_API_URL),
            'IPFS_GATEWAY': JSON.stringify(process.env.IPFS_GATEWAY),
            'IPFS_CID': JSON.stringify(process.env.IPFS_CID),
            'STRING_API_KEY': JSON.stringify(process.env.STRING_API_KEY),
            'BYPASS_DEVICE_CHECK': JSON.stringify(process.env.BYPASS_DEVICE_CHECK),
        },
        // Internal packages not meant for client consumption should be here
        noExternal: [],
    };
});
