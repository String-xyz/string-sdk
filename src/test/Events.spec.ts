import { testPayload } from "./mock";
import { StringPay } from "$lib/StringPay";
import { Events } from "$lib/services/events.service";

describe.skip("Events.ts", () => {
    beforeEach(() => {
        (<any>window).StringPay = new StringPay(() => {});

        window.StringPay.frame = document.createElement("iframe");
        window.StringPay.payload = testPayload;
    });

    it("handles iframe_ready event", () => {
        const event = { eventName: Events.IFRAME_READY };

        // comment out the following line till we fix these tests
        // In order to fix these tests, we need to expose some other functions and create services mock
        // handleEvent(event)

        expect(window.StringPay.isLoaded).toBeTruthy();
    });

    it("handles iframe_resize event", () => {
        const height = 400;
        const event = { eventName: Events.IFRAME_RESIZE, data: { height } };

        // comment out the following line till we fix these tests
        // In order to fix these tests, we need to expose some other functions and create services mock
        // handleEvent(event)

        expect(window.StringPay?.frame?.style.height).toBe(height + "px");
    });
});
