import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript'
import analyze from 'rollup-plugin-analyzer';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

import { config } from 'dotenv';
config();

const version = process.env.npm_package_version

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
		analyze()
	],
	watch: {
		clearScreen: false
	}
};
