<script lang="ts">
	import { StringPayButton } from "$lib";
	import { testPayload as payload } from '$lib/StringPay'

</script>

<div>
	<StringPayButton {payload} />
	<div class="string-pay-frame" />
</div>