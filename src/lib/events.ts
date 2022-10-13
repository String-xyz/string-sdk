import StringPay from './StringPay'

const CHANNEL = "STRING_PAY"


interface StringEvent {
	eventName: string;
	data?: any;
}

export enum Events {
	IFRAME_READY = "ready",
	INIT = "init",
}

export const sendEvent = (frame: HTMLIFrameElement, eventName: string, data: any) => {
    if (!frame) {
        console.error("string-pay-frame element not found");
        throw new Error("string-pay-frame element not found");
    }

    const message = JSON.stringify({
        channel: CHANNEL,
        event: { eventName, data },
    });

	console.log("message", message)

    frame.contentWindow?.postMessage(message, '*');
}

export const registerEvents = () => {
	window.addEventListener('message', function (e) {
		if (e.data?.data?.name) return;
		console.log("On String SDK side ", e)

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
	console.log("Event received", event);
	switch (event.eventName) {
		case Events.IFRAME_READY:
			if (!StringPay.frame || !StringPay.payload) {
				console.log("no frame/payload")
				break;
			}

			StringPay.isLoaded = true

			sendEvent(StringPay.frame, Events.INIT, StringPay.payload);
	}
}