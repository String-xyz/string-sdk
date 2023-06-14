<script lang="ts">
    import * as stringSdk from "$lib/sdk";
    import { onMount } from "svelte";

    export let payload: stringSdk.StringPayload;
    export let disabled = false;

    // let StringPay: StringPay;

    // onMount(() => {
    // 	StringPay = window.StringPay;

    // 	if (!StringPay) {
    // 		console.error("[String Pay] Cannot find stringpay module in DOM");
    // 	}
    // });

    const init = (payload: stringSdk.StringPayload) => {
        const stringPay = stringSdk.init({
            env: "LOCAL",
            apiKeyPublic: "str.b91b21dedf1640b488296bf2a0996197",
            bypassDeviceCheck: true,
            payload,
        });

        stringPay.loadIframe();

        window.StringPay = stringPay;
    };
</script>

<button class="btn btn-primary rounded border-2 tracking-wider text-white h-11" {disabled} on:click={() => init(payload)}>Mint with Card </button>

<style>
    .btn[disabled] {
        background-color: #b6d5ec;
        color: #faf9f9;
    }
</style>
