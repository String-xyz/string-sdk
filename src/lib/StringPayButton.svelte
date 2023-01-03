<script lang='ts'>
  	import type { StringPay, StringPayload } from '$lib/StringPay';
	import { onMount } from 'svelte'
	
	export let payload: StringPayload;
	export let disabled = false;

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
	class="btn btn-primary rounded border-2 tracking-wider text-white h-11"
	{disabled}
	on:click={() => init(payload)}>Mint with Card
</button>

<style>
	.btn[disabled] {
		background-color: #B6D5EC;
		color: #FAF9F9;
	}
</style>