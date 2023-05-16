/// <reference types="@sveltejs/kit" />

import type { StringPay } from "$lib/StringPay";
declare global {
	interface Window {
		StringPay: StringPay;
		ethereum: any;
	}
}
