import { createApiClient } from "./apiClient.service";
import { createLocationService } from "./location.service";
import { createAuthService } from "./auth.service";
import { createQuoteService } from "./quote.service";

export interface Services {
	apiClient: ReturnType<typeof createApiClient>;
	locationService: ReturnType<typeof createLocationService>;
	authService: ReturnType<typeof createAuthService>;
	quoteService: ReturnType<typeof createQuoteService>;
}

interface ServiceParams {
	apiKey: string;
	apiUrl: string;
	walletAddress: string;
}

export function createServices({ apiKey, apiUrl, walletAddress }: ServiceParams): Services {
	const apiClient = createApiClient({
		apiKey,
		baseUrl: apiUrl,
		walletAddress
	});

	const locationService = createLocationService();
	const authService = createAuthService({ apiClient, locationService });
	const quoteService = createQuoteService(apiClient);

	return {
		apiClient,
		locationService,
		authService,
		quoteService
	};
}