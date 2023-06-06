import type { ApiClient, Quote, ExecutionRequest } from './apiClient.service';

export function createQuoteService(apiClient: ApiClient): QuoteService {
	let interval: NodeJS.Timer | undefined;

	async function startQuote(payload: ExecutionRequest, callback: (quote: Quote | null, err: any) => void) {
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

	async function _refreshQuote(payload: ExecutionRequest, callback: (quote: Quote | null, err: any) => void) {
		try {
			const quote = await apiClient.getQuote(payload);
			callback(quote, null);
		} catch (err: any) {
			console.debug('-- refresh quote error --', err);
			callback(null, err);
		}
	}

	return {
		startQuote,
		stopQuote,
	};
}

export interface QuoteService {
	startQuote: (payload: ExecutionRequest, callback: (quote: Quote | null, err: any) => void) => Promise<void>;
	stopQuote: () => void;
}