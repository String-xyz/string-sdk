/// <reference types="@sveltejs/kit" />

import type { StringPay } from "$lib/StringPay";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
	interface Window {
		StringPay: StringPay;
		ethereum: any;
	}
}
