// TODO: move fingerprint stuff to the iframes and left only the cached data management here

import * as FingerprintJS from "@fingerprintjs/fingerprintjs-pro";
import type { Config, LocationService, VisitorData } from "@src/types";

const CUSTOM_SUBDOMAIN = "https://metrics.string.xyz";

export function createLocationService(config: Config, options = {}): LocationService {
    const apiKey = config.analyticsPublicKey;
    let fpInstance: FingerprintJS.Agent | undefined;
    let cachedData: VisitorData | undefined;

    async function getFPInstance() {
        const loadOptions = {
            apiKey,
            endpoint: [
                CUSTOM_SUBDOMAIN, // This endpoint will be used primarily
                FingerprintJS.defaultEndpoint, // The default endpoint will be used if the primary fails
            ],
            ...options,
        };

        if (!fpInstance) {
            fpInstance = await FingerprintJS.load(loadOptions);
        }

        return fpInstance;
    }

    /**
     * @param options extendedResult: boolean - if true, the result will contain additional data
     * @returns VisitorData if the request was successful, undefined otherwise
     */
    async function getVisitorData(options = { extendedResult: true }) {
        try {
            const fp = await getFPInstance();
            return await fp.get(options);
        } catch (e) {
            console.debug("analytics service error:", e);
            return;
        }
    }

    async function getCachedVisitorData() {
        if (!cachedData) {
            cachedData = await getVisitorData();
        }

        return cachedData;
    }

    function setCachedVisitorData(visitorData: VisitorData) {
        cachedData = visitorData;
    }

    return {
        getFPInstance,
        getVisitorData,
        setCachedVisitorData,
        getCachedVisitorData,
    };
}
