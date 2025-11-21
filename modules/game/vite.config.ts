import { defineConfig } from 'vite';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/SGDemo/',
  server: {
    port: 3001,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
      strict: false
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@common': path.resolve(__dirname, '../common/src'),
      '@game': path.resolve(__dirname, './src')
    }
  },
  publicDir: path.resolve(__dirname, '../common/media')
});
