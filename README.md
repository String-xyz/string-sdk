# String SDK

![Version](https://img.shields.io/github/package-json/v/String-xyz/string-sdk)
![Downloads](https://img.shields.io/npm/dw/@stringpay/sdk)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)

## Usage

Install the package through `npm` or `yarn` as follows:

```
npm i @stringpay/sdk
// or
yarn @stringpay/sdk
```

Load the SDK's script in the root of your app like so:

```HTML
<script src="../node_modules/@stringpay/sdk/dist/stringpay-v0.2.0.min.js"></script>
```

Initialize the SDK in onMount (client side):
```JS
window.StringPay.init({
	env: "LOCAL", // Can be PROD, SANDBOX, DEV, or LOCAL
	publicKey: apiKey,
});
```

With this in place, add your `String Checkout` button anywhere you'd like:

```HTML
<button onClick={() => StringPay.loadFrame(payload)}>String Checkout</button>
```

The `StringPay` object can be fetched from the `window` object.

Add a div anywhere on your app where you'd like to render the payment modal:

```HTML
<div class="string-pay-frame" />
```

Refer to our [documentation](https://stringxyz.readme.io/docs/sdk-quick-start) for more in-depth explanations and help regarding transaction payload formats.

## Types

The SDK's types can be imported if necessary. For example:

```ts
import type { StringPayload } from '@stringpay/sdk';
```
