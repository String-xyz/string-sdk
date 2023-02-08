import type { StringPay, StringPayload } from './StringPay';
import type { Services } from './services';
import type { QuoteRequestPayload, TransactPayload, User } from './services/apiClient.service';

const CHANNEL = "STRING_PAY"
const IFRAME_URL = new URL(import.meta.env.VITE_IFRAME_URL).origin;

export function createEventsService(stringPay: StringPay, services: Services, user: User | null) {
	const { authService, quoteService } = services;

	if (!stringPay.frame || !stringPay.payload) {
		throw new Error("No frame found");
	}
	const stringPayload = stringPay.payload;
	const frame = stringPay.frame;

	const eventHandlers: Record<string, (event: StringEvent) => void> = {
		[Events.IFRAME_READY]: onIframeReady,
		[Events.IFRAME_CLOSE]: onIframeClose,
		[Events.IFRAME_RESIZE]: onIframeResize,
		[Events.REQUEST_AUTHORIZE_USER]: onAuthorizeUser,
		[Events.REQUEST_RETRY_LOGIN]: onRetryLogin,
		[Events.REQUEST_EMAIL_VERIFICATION]: onEmailVerification,
		[Events.REQUEST_QUOTE_START]: onQuoteStart,
		[Events.REQUEST_QUOTE_STOP]: onQuoteStop,
		[Events.REQUEST_CONFIRM_TRANSACTION]: onConfirmTransaction,
	};

	const sendEvent = <T = any>(frame: HTMLIFrameElement, eventName: string, data?: T, error?: any) => {
		if (!frame) {
			err("a frame was not provided to sendEvent")
		}
		const stringEvent: StringEvent = { eventName, data, error };
		const message = JSON.stringify({
			channel: CHANNEL,
			event: stringEvent,
		});

		frame.contentWindow?.postMessage(message, '*');
	}

	const _handleEvent = async (e: any) => {
		if (e.origin !== IFRAME_URL) return;

		try {
			const payload = JSON.parse(e.data);
			const channel = payload.channel;
			const event = <StringEvent>payload.event
			if (channel === CHANNEL) {
				const handler = eventHandlers[event.eventName];
				if (handler) await handler(event);
				else console.debug("SDK :: Unhandled event: ", event);
			}
		} catch (error) {
			console.error('sdk: _handleEvent error: ', error);
		}
	};

	const registerEvents = () => {
		unregisterEvents();

		window.addEventListener('message', _handleEvent);
	};

	const unregisterEvents = () => {
		window.removeEventListener('message', _handleEvent, false);
	};

	/** -------------- EVENT HANDLERS  ---------------- */

	async function onIframeReady() {
		const iframePayload = createIframePayload(stringPayload, user);
		sendEvent(frame, Events.LOAD_PAYLOAD, iframePayload);
		stringPay.isLoaded = true;
		stringPay.onFrameLoad();
	}

	async function onIframeClose() {
		stringPay.frame?.remove();
		stringPay.frame = undefined;
		stringPay.isLoaded = false;
		unregisterEvents();
		stringPay.onFrameClose();
		quoteService.stopQuote();
	}

	async function onIframeResize(event: StringEvent) {
		if (event.data?.height != frame.scrollHeight) {
			frame.style.height = (event.data?.height ?? frame.scrollHeight) + "px";
		}
	}

	async function onAuthorizeUser() {
		try {
			const { user } = await authService.loginOrCreateUser(stringPayload.userAddress);
			sendEvent(frame, Events.RECEIVE_AUTHORIZE_USER, { user });
		} catch (error: any) {
			console.log('SDK :: onAuthorizeUser error: ', error);
			sendEvent(frame, Events.RECEIVE_AUTHORIZE_USER, {}, error);
		}
	}

	async function onRetryLogin() {
		try {
			const { user } = await authService.retryLogin();
			sendEvent(frame, Events.RECEIVE_RETRY_LOGIN, { user });
		} catch (error) {
			sendEvent(frame, Events.RECEIVE_RETRY_LOGIN, {}, error);
		}
	}

	async function onEmailVerification(event: StringEvent) {
		try {
			const data = <{ userId: string, email: string }>event.data;
			await services.apiClient.requestEmailVerification(data.userId, data.email);
			sendEvent(frame, Events.RECEIVE_EMAIL_VERIFICATION, { status: 'email_verified' });
		} catch (error: any) {
			sendEvent(frame, Events.RECEIVE_EMAIL_VERIFICATION, {}, error);
		}
	}

	async function onQuoteStart() {
		const payload = <QuoteRequestPayload>stringPayload;

		const callback = (quote: TransactPayload) => sendEvent(frame, Events.QUOTE_CHANGED, { quote });
		quoteService.startQuote(payload, callback);
	}

	async function onQuoteStop() {
		quoteService.stopQuote();
	}

	async function onConfirmTransaction(event: StringEvent) {
		try {
			const data = <TransactPayload>event.data;
			const txHash = await services.apiClient.transact(data);
			sendEvent(frame, Events.RECEIVE_CONFIRM_TRANSACTION, txHash);
		} catch (error: any) {
			sendEvent(frame, Events.RECEIVE_CONFIRM_TRANSACTION, {}, error);

		}
	}

	const watchWalletChange = () => {
		window.ethereum.on('accountsChanged', (accounts: string[]) => {
			services.apiClient.setWalletAddress(accounts[0]);
			onIframeClose();
			logout();
		});

	}

	function logout() {
		services.apiClient.logoutUser();
	}

	return {
		registerEvents,
		unregisterEvents,
		sendEvent,
		watchWalletChange
	}
}

// Parse payload before sending it to the iframe
function createIframePayload(payload: StringPayload, _user: User | null): IframePayload {
	const nft: NFT = {
		name: payload.name,
		price: payload.price,
		currency: payload.currency,
		collection: payload.collection ?? "",
		imageSrc: payload.imageSrc,
		imageAlt: payload?.imageAlt ?? "NFT"
	};

	return {
		nft,
		user: {
			walletAddress: payload.userAddress,
			id: _user?.id ?? "",
			status: _user?.status ?? "",
			email: _user?.email ?? "",
		}
	};
}

function err(msg: string) {
	console.error("[String Pay] " + msg)
}

export enum Events {
	LOAD_PAYLOAD = 'load_payload',
	IFRAME_READY = 'ready',
	IFRAME_RESIZE = 'resize',
	IFRAME_CLOSE = 'close',
	REQUEST_AUTHORIZE_USER = 'request_authorize_user',
	RECEIVE_AUTHORIZE_USER = 'receive_authorize_user',
	REQUEST_RETRY_LOGIN = 'request_retry_login',
	RECEIVE_RETRY_LOGIN = 'receive_retry_login',
	REQUEST_EMAIL_VERIFICATION = "request_email_verification",
	RECEIVE_EMAIL_VERIFICATION = "receive_email_verification",
	REQUEST_CONFIRM_TRANSACTION = "request_confirm_transaction",
	RECEIVE_CONFIRM_TRANSACTION = "receive_confirm_transaction",
	REQUEST_QUOTE_START = "request_quote_start",
	QUOTE_CHANGED = "quote_changed",
	REQUEST_QUOTE_STOP = "request_quote_stop"
}

export interface StringEvent {
	eventName: string;
	data?: any;
	error: string;
}

export interface NFT {
	name: string;
	price: number;
	currency: string;
	collection?: string;
	imageSrc: string;
	imageAlt?: string;
}

export interface IframePayload {
	nft: NFT;
	user: {
		id: string;
		walletAddress: string;
		status: string;
		email: string;
	}
}
