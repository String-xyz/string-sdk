import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy'

import { config } from 'dotenv';
config();

const version = process.env.npm_package_version

const ENV_TABLE = [
	{ name: 'PROD_IFRAME_URL', value: process.env.PROD_IFRAME_URL },
	{ name: 'PROD_API_URL', value: process.env.PROD_API_URL },
	{ name: 'SBOX_IFRAME_URL', value: process.env.SBOX_IFRAME_URL },
	{ name: 'SBOX_API_URL', value: process.env.SBOX_API_URL },
	{ name: 'DEV_IFRAME_URL', value: process.env.DEV_IFRAME_URL },
	{ name: 'DEV_API_URL', value: process.env.DEV_API_URL },
	{ name: 'LOCAL_IFRAME_URL', value: process.env.LOCAL_IFRAME_URL },
	{ name: 'LOCAL_API_URL', value: process.env.LOCAL_API_URL },
]

for (const env of ENV_TABLE) {
	if (!env.value) {
		throw Error(`Missing ${env.name} in .env`)
	}
}

if (!process.env.VITE_ANALYTICS_LIB_PK) {
	throw Error(`Missing VITE_ANALYTICS_LIB_PK in .env`)
}

if (!process.env.VITE_ANALYTICS_SUBDOMAIN_URL) {
	throw Error(`Missing VITE_ANALYTICS_SUBDOMAIN_URL in .env`)
}

export default {
	input: './src/lib/StringPay.ts',
	output: {
		name: 'stringpay',
		file: `./dist/stringpay-v${version}.min.js`,
		sourcemap: false,
		format: 'iife',
	},
	plugins: [
		typescript(),
		json(),
		commonjs(),
		resolve({ jsnext: true, preferBuiltins: true, browser: true }),
		replace({
			values: {
				...ENV_TABLE.reduce((acc, env) => {
					acc[`import.meta.env.${env.name}`] = JSON.stringify(new URL(env.value).origin);
					return acc
				}, {}),
				'import.meta.env.VITE_ANALYTICS_LIB_PK': JSON.stringify(process.env.VITE_ANALYTICS_LIB_PK),
				'import.meta.env.VITE_ANALYTICS_SUBDOMAIN_URL': JSON.stringify(process.env.VITE_ANALYTICS_SUBDOMAIN_URL),
			},
			preventAssignment: true
		}),
		terser(),
		copy({
			targets: [{ src: 'src/lib/StringPay.d.ts', dest: './dist/', rename: 'index.d.ts' }]
		}),
	],
	watch: {
		clearScreen: false
	}
};
