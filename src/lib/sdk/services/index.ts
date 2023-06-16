import type { Config } from "../config";
import { createApiClient } from "./apiClient.service";
import { createLocationService } from "./location.service";
import { createAuthService } from "./auth.service";
import { createQuoteService } from "./quote.service";
import { createWalletService } from "./wallet.service";
import { createEventsService } from "./events.service";

export function createServices(config: Config): Services {
    const apiClient = createApiClient(config.apiUrl, config.apiKeyPublic);

    const events = createEventsService();
    const locationService = createLocationService();
    const auth = createAuthService({ apiClient, locationService, bypassDeviceCheck: config.bypassDeviceCheck });
    const quote = createQuoteService(apiClient);
    const wallet = createWalletService(apiClient);

    return {
        events,
        apiClient,
        location: locationService,
        auth,
        quote,
        wallet,
    };
}

export interface ServiceParams {
    baseUrl: string;
    iframeUrl: string;
    apiKey: string;
    bypassDeviceCheck?: boolean;
}

// services interface
export interface Services {
    events: ReturnType<typeof createEventsService>;
    apiClient: ReturnType<typeof createApiClient>;
    location: ReturnType<typeof createLocationService>;
    auth: ReturnType<typeof createAuthService>;
    quote: ReturnType<typeof createQuoteService>;
    wallet: ReturnType<typeof createWalletService>;
}
