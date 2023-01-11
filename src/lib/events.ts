const CHANNEL = "STRING_PAY"
const IFRAME_URL = new URL(import.meta.env.VITE_IFRAME_URL).origin

interface StringEvent {
	eventName: string;
	data?: any;
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
	REQUEST_SIGNATURE = 'request_signature',
	RECEIVE_SIGNATURE = 'receive_signature',
}

export const sendEvent = (frame: HTMLIFrameElement, eventName: string, data?: any) => {
	if (!frame) {
		err("sendEvent was not sent a frame")
	}

	const message = JSON.stringify({
		channel: CHANNEL,
		event: { eventName, data },
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

		case Events.REQUEST_SIGNATURE:
			// sign the payload and send it back to the iframe
			const nonce = event.data;

			try {
				const signature = await window.ethereum.request({
					method: 'personal_sign',
					params: [nonce, payload.userAddress],
				});
				sendEvent(frame, Events.RECEIVE_SIGNATURE, signature);
			} catch (error) {
				console.log("SDK :: Wallet signature error: ", error);
			}

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
