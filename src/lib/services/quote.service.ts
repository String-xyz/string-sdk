import type { ApiClient, QuoteRequestPayload, TransactPayload } from './apiClient.service';

export function createQuoteService(apiClient: ApiClient): QuoteService {
	let interval: NodeJS.Timer | undefined;

	async function startQuote(payload: QuoteRequestPayload, callback: (payload: TransactPayload) => void) {
		refreshQuote(payload, callback);

		if (interval) {
			clearInterval(interval);
		}

		interval = setInterval(() => refreshQuote(payload, callback), 10000);
	}

	function stopQuote() {
		clearInterval(interval);
		interval = undefined;
	}

	async function refreshQuote(payload: QuoteRequestPayload, callback: (payload: TransactPayload) => void) {
		try {
			const quote = await apiClient.getQuote(payload);
			callback(quote);
		} catch (e) {
			console.debug('-- refresh quote error --', e);
		}
	}

	return {
		startQuote,
		stopQuote,
		refreshQuote,
	};
}

export interface QuoteService {
	startQuote: (payload: QuoteRequestPayload, callback: (payload: TransactPayload) => void) => Promise<void>;
	stopQuote: () => void;
	refreshQuote: (payload: QuoteRequestPayload, callback: (payload: TransactPayload) => void) => Promise<void>;
}