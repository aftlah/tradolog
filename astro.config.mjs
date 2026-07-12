// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	integrations: [react()],
	adapter: vercel(),
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
				'@features': fileURLToPath(new URL('./src/features', import.meta.url)),
				'@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
			},
		},
	},
});
