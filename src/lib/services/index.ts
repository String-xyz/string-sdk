import { createApiClient } from "./apiClient.service";
import { createLocationService } from "./location.service";
import { createAuthService } from "./auth.service";
import { createQuoteService } from "./quote.service";
import { createEventsService } from "./events.service";

export function createServices({ baseUrl, iframeUrl, apiKey, bypassDeviceCheck = false }: ServiceParams): Services {
    const apiClient = createApiClient({ baseUrl, apiKey });

    const locationService = createLocationService();
    const authService = createAuthService({ apiClient, locationService, bypassDeviceCheck });
    const quoteService = createQuoteService(apiClient);
    const eventsService = createEventsService(iframeUrl, authService, quoteService, apiClient, locationService);

    return {
        apiClient,
        locationService,
        authService,
        quoteService,
        eventsService,
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
    apiClient: ReturnType<typeof createApiClient>;
    locationService: ReturnType<typeof createLocationService>;
    authService: ReturnType<typeof createAuthService>;
    quoteService: ReturnType<typeof createQuoteService>;
    eventsService: ReturnType<typeof createEventsService>;
}
