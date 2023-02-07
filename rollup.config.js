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

if (!process.env.VITE_IFRAME_URL || !process.env.VITE_API_URL || !process.env.VITE_ANALYTICS_LIB_PK) {
	throw Error("Missing variables in .env")
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
				'import.meta.env.VITE_IFRAME_URL': JSON.stringify(new URL(process.env.VITE_IFRAME_URL).origin),
				'import.meta.env.VITE_API_URL': JSON.stringify(new URL(process.env.VITE_API_URL).origin),
				'import.meta.env.VITE_ANALYTICS_LIB_PK': JSON.stringify(process.env.VITE_ANALYTICS_LIB_PK),
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
