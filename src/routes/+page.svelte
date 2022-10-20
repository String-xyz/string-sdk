<script lang="ts">
	import { StringPayButton, type StringPay } from "$lib";
	import { testPayload as payload } from '$lib/StringPay'
	import { onMount } from 'svelte'
	import "../app.css";

	let StringPay: StringPay;

	onMount(() => {
		if (!StringPay) {
			StringPay = window.StringPay
			StringPay.init({
				apiKey: "test"
			});
		}
	});

</script>

<div>
	<StringPayButton {payload} />
	<div class="string-pay-frame" />
</div>