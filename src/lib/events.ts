const CHANNEL = "STRING_PAY"

interface StringEvent {
	eventName: string;
	data?: any;
}

const err = (msg: string) => {
	console.error("[String Pay] " + msg)
}

export enum Events {
	IFRAME_READY = "ready",
	INIT = "init",
	RESIZE = "resize",
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

export const registerEvents = () => {
	window.addEventListener('message', function (e) {
		if (e.data?.data?.name) return;
		
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

export const handleEvent = (event: StringEvent) => {
	const frame = window?.StringPay?.frame;
	const payload = window?.StringPay?.payload;

	if (!frame || !payload) {
		err("Cannot find frame or payload")
		return;
	}

	switch (event.eventName) {
		case Events.IFRAME_READY:
			sendEvent(frame, Events.INIT, payload);
			window.StringPay.isLoaded = true;
		break;

		case Events.RESIZE:
			if (event.data?.height != frame.scrollHeight) {
				frame.style.height = (event.data?.height ?? frame.scrollHeight) + "px";
			}
		break;

	}
}