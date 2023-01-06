<script lang="ts">
	import type { StringPay, StringPayload } from "$lib/StringPay";
	import { onMount } from "svelte";
	import { sendEvent, Events } from "$lib/events";
	import { walletAddress } from "$lib/wallet";

	export let payload: StringPayload;
	export let disabled = false;

	let StringPay: StringPay;

	onMount(() => {
		StringPay = window.StringPay;

		if (!StringPay) {
			console.error("[String Pay] Cannot find stringpay module in DOM");
		}
	});

	const init = (payload: StringPayload) => {
		StringPay?.loadFrame(payload);
		if (!StringPay?.frame) {
			console.error("[String Pay] Cannot find stringpay frame in DOM");
			return;
		}

		// every time the wallet address changes, we need to update the payload and send it to the iframe
		walletAddress.subscribe((address: string) => {
			payload.userAddress = address;
			if (StringPay?.frame) {
				sendEvent(StringPay.frame, Events.PAYLOAD_CHANGED, payload);
				return;
			}
		});
	};
</script>

<button
	class="btn btn-primary rounded border-2 tracking-wider text-white h-11"
	{disabled}
	on:click={() => init(payload)}
	>Mint with Card
</button>

<style>
	.btn[disabled] {
		background-color: #b6d5ec;
		color: #faf9f9;
	}
</style>
