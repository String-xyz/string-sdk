import { QuoteService, ApiClient, Quote, ExecutionRequest } from "../types";

export function createQuoteService(apiClient: ApiClient): QuoteService {
    let interval: NodeJS.Timer | undefined;

    async function getQuote(payload: ExecutionRequest) {
        return apiClient.getQuote(payload);
    }

    async function startQuote(payload: ExecutionRequest, callback: (quote: Quote) => void) {
        _refreshQuote(payload, callback);

        if (interval) {
            clearInterval(interval);
        }

        interval = setInterval(() => _refreshQuote(payload, callback), 10000);
    }

    function stopQuote() {
        clearInterval(interval);
        interval = undefined;
    }

    async function _refreshQuote(payload: ExecutionRequest, callback: (quote: Quote) => void) {
        try {
            const quote = await apiClient.getQuote(payload);
            callback(quote);
        } catch (err: any) {
            console.debug("-- refresh quote error --", err);
        }
    }

    return {
        getQuote,
        startQuote,
        stopQuote,
    };
}
