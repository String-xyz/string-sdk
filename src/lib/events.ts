import { authService } from './services';
const CHANNEL = "STRING_PAY"
const IFRAME_URL = import.meta.env.VITE_IFRAME_URL// new URL(import.meta.env.VITE_IFRAME_URL).origin;

interface StringEvent {
	eventName: string;
	data?: any;
	errorCode: string;
}

const err = (msg: string) => {
	console.error("[String Pay] " + msg)
}

export enum Events {
	LOAD_PAYLOAD = 'load_payload',
	UPDATE_USER = 'update_user',
	IFRAME_READY = 'ready',
	IFRAME_RESIZE = 'resize',
	IFRAME_CLOSE = 'close',
	REQUEST_AUTHORIZE_USER = 'request_authorize_user',
	RECEIVE_AUTHORIZE_USER = 'receive_authorize_user',
	REQUEST_RETRY_LOGIN = 'request_retry_login',
	RECEIVE_RETRY_LOGIN = 'receive_retry_login',
};

export const sendEvent = <T = any>(frame: HTMLIFrameElement, eventName: string, data?: T, error?: any) => {
	if (!frame) {
		err("sendEvent was not sent a frame")
	}

	const message = JSON.stringify({
		channel: CHANNEL,
		event: { eventName, data, errorCode: error?.code },
	});

	frame.contentWindow?.postMessage(message, '*');
}

export const handleEvent = async (event: StringEvent) => {
	const StringPay = window.StringPay;
	const frame = StringPay?.frame;
	const payload = StringPay?.payload;

	if (!frame || !payload) {
		err("Cannot find frame or payload")
		return;
	}

	switch (event.eventName) {
		case Events.IFRAME_READY:
			sendEvent(frame, Events.LOAD_PAYLOAD, payload);
			StringPay.isLoaded = true;
			StringPay.onframeload();
			break;

		case Events.IFRAME_CLOSE:
			StringPay.frame?.remove();
			StringPay.frame = undefined;
			StringPay.isLoaded = false;
			unregisterEvents();
			StringPay.onframeclose();
			break;

		case Events.IFRAME_RESIZE:
			if (event.data?.height != frame.scrollHeight) {
				frame.style.height = (event.data?.height ?? frame.scrollHeight) + "px";
			}

		case Events.REQUEST_AUTHORIZE_USER:
			console.log('1 SDK: REQUEST_AUTHORIZE_USER event received');
			try {
				const { user } = await authService.loginOrCreateUser(payload.userAddress);
				console.log('2 SDK: REQUEST_AUTHORIZE_USER event received', user);
				sendEvent(frame, Events.RECEIVE_AUTHORIZE_USER, { user });
			} catch (error: any) {
				console.log('SDK: REQUEST_AUTHORIZE_USER event handler error: ', error);
				sendEvent(frame, Events.RECEIVE_AUTHORIZE_USER, {}, error);
			}

			break;

		case Events.REQUEST_RETRY_LOGIN:
			// try {
			// 	const { user } = await authService.retryLogin();
			// 	sendEvent(frame, Events.RECEIVE_RETRY_LOGIN, { user });
			// } catch (error) {
			// 	console.log('REQUEST_RETRY_LOGIN event handler error: ', error);
			// 	sendEvent(frame, Events.RECEIVE_RETRY_LOGIN, {}, error);
			// }

			break;

		default:
			console.log("SDK :: Unhandled event: ", event);
			break;
	}
}

const _handleEvent = async (e: any) => {
	if (e.origin !== IFRAME_URL) return;

	try {
		const payload = JSON.parse(e.data);
		const channel = payload.channel;
		const event = payload.event
		if (channel == CHANNEL) {
			await handleEvent(event);
		}
	} catch (error) {
		console.log(error);
	}
};

export const unregisterEvents = () => {
	window.removeEventListener('message', _handleEvent);
};

export const registerEvents = () => {
	unregisterEvents();

	window.addEventListener('message', _handleEvent);
};
