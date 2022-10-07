const CHANNEL = "STRING_PAY"

export const sendEvent = (elem, eventName, data) => {
    if (!elem) {
        console.error("String element not defined");
        throw new Error("String element not defined");
    }

    const message = JSON.stringify({
        channel: CHANNEL,
        event: { eventName, payload: data },
    });

    elem.contentWindow.postMessage(message, '*');
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

export const handleEvent = (event) => {
	console.log("Event received", event);
}

export enum Events {
	INIT = "init"
}