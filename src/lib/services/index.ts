import { createApiClient } from "./apiClient.service";
import { createLocationService } from "./location.service";
import { createAuthService } from "./auth.service";

export const apiClient = createApiClient();
export const locationService = createLocationService();
export const authService = createAuthService({ apiClient, locationService });
