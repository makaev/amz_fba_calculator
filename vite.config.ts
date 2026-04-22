import { defineConfig } from 'vite';

export default defineConfig({
  base: '/amz_fba_calculator/',
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true
  }
});
