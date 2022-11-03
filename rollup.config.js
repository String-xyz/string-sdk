import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import analyze from 'rollup-plugin-analyzer';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import { config } from 'dotenv';
config();

const prod = !process.env.ROLLUP_WATCH;

export default {
	input: 'package/index.js',
	output: {
		name: "string_sdk",
		file: 'build/svelte-sdk.min.js',
		sourcemap: true,
		format: 'iife',
	},
	plugins: [
		replace({
			values: {
				'import.meta.env.VITE_IFRAME_URL': JSON.stringify(process.env.VITE_IFRAME_URL)
			},
			preventAssignment: true
		}),
		svelte(),
		resolve(),
		commonjs(),
		prod && terser(),
		analyze()
	],
	watch: {
		clearScreen: false
	}
};
