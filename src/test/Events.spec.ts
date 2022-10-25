import { StringPay } from "$lib";
import { handleEvent, Events } from '$lib/events'
import { testPayload } from '$lib/StringPay'

describe('Events.ts', () => {
	beforeEach(() => {
		(<any>window).StringPay = new StringPay()

		window.StringPay.frame = document.createElement("iframe")
		window.StringPay.payload = testPayload
	})

	it('handles iframe_ready event', () => {
		const event = { eventName: Events.IFRAME_READY }

		handleEvent(event)

		expect(window.StringPay.isLoaded).toBeTruthy()
	});

	it('handles resize event', () => {
		const height = 400
		const event = { eventName: Events.RESIZE, data: {height} }

		handleEvent(event)

		expect(window.StringPay?.frame?.style.height).toBe(height + "px")
	});

});
