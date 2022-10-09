import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';

import { defineConfig } from 'vite'

export default defineConfig(({ command, mode, ssrBuild }) => {
    return {
        build: {
            sourcemap: true,
            ...(mode === "dev" ? {
                watch: {
                    exclude: 'node_modules/**',
                    include: 'src/**'
                }
            } : {}),
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    notfound: resolve(__dirname, '404.html')
                }
            }
        },
        plugins: [
            handlebars({
                partialDirectory: resolve(__dirname, 'src/views'),
            }),
        ]
    }
})

