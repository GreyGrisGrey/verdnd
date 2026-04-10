import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
    build: {
        outDir: 'dist/client',
        target: 'es2022',
        // Keep generated pages from components.ts under dist/client/pages.
        emptyOutDir: false,
        rollupOptions: {
            input: {
                game: resolve(__dirname, 'client/mainDriver.ts'),
                landing: resolve(__dirname, 'client/landing.ts'),
                registration: resolve(__dirname, 'client/registration.ts'),
            },
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
    },
});
