import { defineConfig } from 'astro/config';
import tailwindv4 from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  base: '/Dinamo/sites/nexusfinal/',
  vite: {
    plugins: [tailwindv4()],
  },
});
