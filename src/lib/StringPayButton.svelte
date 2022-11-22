<script lang='ts'>
  	import type { StringPay, StringPayload } from '$lib/StringPay';
	import { onMount } from 'svelte'
	
	export let payload: StringPayload;

	let StringPay: StringPay;

	onMount(() => {
		StringPay = window.StringPay
		
		if (!StringPay) {
			console.error('[String Pay] Cannot find stringpay module in DOM')
		}
	});

	const init = (payload: StringPayload) => {
		StringPay?.loadFrame(payload);
	}
</script>

<button
	class="btn btn-primary rounded border-2 normal-case"
	on:click={() => init(payload)}>Mint with Card
</button>