// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	prefetch: {
		prefetchAll: false,
		defaultStrategy: 'hover',
	},
	integrations: [react()],
	adapter: vercel(),
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			include: ['recharts', 'lucide-react', 'framer-motion', '@tanstack/react-table'],
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes('node_modules/recharts')) {
							return 'recharts';
						}
						if (id.includes('node_modules/@tanstack/react-table')) {
							return 'tanstack-table';
						}
						if (id.includes('node_modules/framer-motion')) {
							return 'framer-motion';
						}
					},
				},
			},
		},
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
				'@features': fileURLToPath(new URL('./src/features', import.meta.url)),
				'@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
			},
		},
	},
});
