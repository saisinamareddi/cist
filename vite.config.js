import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'portfolio website',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'portfolio website/index.html'),
        login: resolve(__dirname, 'portfolio website/login.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
