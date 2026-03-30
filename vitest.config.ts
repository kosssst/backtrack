// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	resolve: {
		alias: {
			'@test': fileURLToPath(new URL('./tests/setup', import.meta.url)),
			'server-only': fileURLToPath(
				new URL('./tests/setup/empty.ts', import.meta.url),
			),
		},
	},
	test: {
		include: ['./tests/**/*.{test,spec}.{ts,tsx}'],
		environment: 'jsdom',
		setupFiles: ['./tests/setup/setup.ts'],
		css: true,
		clearMocks: true,
		restoreMocks: true,
		maxWorkers: 1,
		fileParallelism: false,

		coverage: {
			reporter: ['text', 'html'],
			exclude: ['src/styles/**', '**/*.module.css'],
		},
	},
});
