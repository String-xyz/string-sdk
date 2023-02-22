import { createApiClient } from "./apiClient.service";
import { createLocationService } from "./location.service";
import { createAuthService } from "./auth.service";
import { createQuoteService } from "./quote.service";
import { createEventsService } from "./events.service";

export interface Services {
    apiClient: ReturnType<typeof createApiClient>;
    locationService: ReturnType<typeof createLocationService>;
    authService: ReturnType<typeof createAuthService>;
    quoteService: ReturnType<typeof createQuoteService>;
}

export function createServices({ apiUrl }: { apiUrl: string }): Services {
    const apiClient = createApiClient({ baseUrl: apiUrl });

    const locationService = createLocationService();
    const authService = createAuthService({ apiClient, locationService });
    const quoteService = createQuoteService(apiClient);
    const eventsService = createEventsService(authService, quoteService, apiClient, locationService);

    return {
        apiClient,
        locationService,
        authService,
        quoteService,
        eventsService,
    };
}

// services interface
export interface Services {
    apiClient: ReturnType<typeof createApiClient>;
    locationService: ReturnType<typeof createLocationService>;
    authService: ReturnType<typeof createAuthService>;
    quoteService: ReturnType<typeof createQuoteService>;
    eventsService: ReturnType<typeof createEventsService>;
}
