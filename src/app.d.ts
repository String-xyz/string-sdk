/// <reference types="@sveltejs/kit" />

import type { StringPay } from "$lib/sdk";
declare global {
    interface Window {
        StringPay: StringPay;
        ethereum: any;
    }
}
