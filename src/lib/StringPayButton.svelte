<script lang='ts'>
  	import type { StringPayload } from '$lib';
	import { StringPay } from '$lib/StringPay' 

	export let payload: StringPayload;

	const init = (payload: any) => {
		StringPay.loadFrame(payload);
	}
</script>

<button
	class="btn btn-primary rounded border-2 normal-case"
	on:click={() => init(payload)}>Mint with Card
</button>