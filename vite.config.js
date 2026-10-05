import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

// `root` apunta a src/ para que Vite use src/index.html como plantilla
// e inyecte el bundle sin duplicar HTML. El build sale a la raiz /dist.
export default defineConfig({
    root: srcDir,
    plugins: [react()],
    base: './',
    build: {
        outDir: fileURLToPath(new URL('./dist', import.meta.url)),
        emptyOutDir: true,
    },
    server: {
        port: 5199,
        open: false,
        watch: {
            // El watcher nativo de Windows puede morir con EBUSY cuando el
            // editor escribe archivos temporales dentro de src/. El sondeo
            // evita ese fallo; el proyecto es pequeno y no cuesta nada.
            usePolling: true,
            interval: 300,
        },
    },
})
