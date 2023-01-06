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
	IFRAME_READY = 'ready',
	IFRAME_RESIZE = 'resize',
	IFRAME_CLOSE = 'close',
	PAYLOAD_CHANGED = 'payload_changed',
}

export const sendEvent = (frame: HTMLIFrameElement, eventName: string, data: any) => {
	if (!frame) {
		err("sendEvent was not sent a frame")
	}

	const message = JSON.stringify({
		channel: CHANNEL,
		event: { eventName, data },
	});

	frame.contentWindow?.postMessage(message, '*');
}

export const handleEvent = (event: StringEvent) => {
	const StringPay = (<any>window)?.StringPay
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
			StringPay.isLoaded = false;
			StringPay.onframeclose();
			break;

		case Events.IFRAME_RESIZE:
			if (event.data?.height != frame.scrollHeight) {
				frame.style.height = (event.data?.height ?? frame.scrollHeight) + "px";
			}
			break;

	}
}

export const registerEvents = () => {
	window.addEventListener('message', function (e) {
		if (e.origin !== IFRAME_URL) return;

		try {
			const payload = JSON.parse(e.data);
			const channel = payload.channel;
			const event = payload.event
			if (channel == CHANNEL) {
				handleEvent(event)
			}
		} catch (error) {
			console.log(error);
		}
	});
}