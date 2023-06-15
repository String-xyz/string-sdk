import * as FingerprintJS from "@fingerprintjs/fingerprintjs-pro";

const CUSTOM_SUBDOMAIN = "https://metrics.string.xyz";
const apiKey = import.meta.env.VITE_ANALYTICS_LIB_PK || "";

export function createLocationService(options = {}): LocationService {
    let fpInstance: FingerprintJS.Agent | undefined;

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

    return { getFPInstance, getVisitorData };
}

export interface VisitorData {
    visitorId?: string;
    requestId?: string;
}

export interface LocationService {
    getFPInstance: () => Promise<FingerprintJS.Agent>;
    getVisitorData: (options?: { extendedResult: boolean }) => Promise<VisitorData | undefined>;
}
