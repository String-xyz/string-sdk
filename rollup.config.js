import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy'

import { config } from 'dotenv';
config();

const version = process.env.npm_package_version

if (!process.env.VITE_IFRAME_URL) {
	throw Error("No VITE_IFRAME_URL found in .env")
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
		replace({
			values: {
				'import.meta.env.VITE_IFRAME_URL': JSON.stringify(process.env.VITE_IFRAME_URL)
			},
			preventAssignment: true
		}),
		resolve(),
		terser(),
		copy({
			targets: [{ src: 'src/lib/StringPay.d.ts', dest: './dist/', rename: 'index.d.ts' }]
		}),
	],
	watch: {
		clearScreen: false
	}
};
