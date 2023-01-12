import type { Writable } from 'svelte/store';
import type { ApiClient, ContractPayload, TransactPayload } from './apiClient.service';

export function createQuoteService(apiClient: ApiClient): QuoteService {
	let interval: NodeJS.Timer | undefined;

	async function refreshQuote(contractPayload: ContractPayload, quoteStore: Writable<TransactPayload | null>) {
		try {
			quoteStore.set(await apiClient.getQuote(contractPayload));
		} catch (e) {
			console.error('-- refreshing quote error --', e);
		}
	}

	async function startQuote(contractPayload: ContractPayload, quoteStore: Writable<TransactPayload | null>) {
		await refreshQuote(contractPayload, quoteStore);

		if (interval) {
			clearInterval(interval);
		}

		interval = setInterval(() => refreshQuote(contractPayload, quoteStore), 10000);
	}

	async function stopQuote(quoteStore: Writable<TransactPayload | null>) {
		clearInterval(interval);
		interval = undefined;
		quoteStore.set(null);
	}

	return {
		refreshQuote,
		startQuote,
		stopQuote,
	};
}

export interface QuoteService {
	/** We cannot use the store directly in the service layer cause the store is frontend only code and the service is server rendered */
	refreshQuote: (contractPayload: ContractPayload, quoteStore: Writable<TransactPayload | null>) => Promise<void>;
	startQuote: (contractPayload: ContractPayload, quoteStore: Writable<TransactPayload | null>) => Promise<void>;
	stopQuote: (quoteStore: Writable<TransactPayload | null>) => Promise<void>;
}