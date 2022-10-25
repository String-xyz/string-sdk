import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: "./testSetup.ts",
		coverage: {
			provider: 'c8',
			reporter: ['json']
		},
	},
	resolve: {
		alias: {
			"$lib": resolve(__dirname, "src/lib/")
		}
	},
}))