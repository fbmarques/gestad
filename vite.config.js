import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['front-end/src/main.tsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'front-end/src'),
        },
    },
    build: {
        outDir: 'public/build',
        manifest: 'manifest.json',
    },
    base: '/build/',
});
