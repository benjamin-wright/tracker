import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';

export default {
    build: {
        sourcemap: true,
        watch: {
            exclude: 'node_modules/**',
            include: 'src/**'
        },
    },
    plugins: [
        handlebars({
            partialDirectory: resolve(__dirname, 'src/views/partials'),
        }),
    ]
}
