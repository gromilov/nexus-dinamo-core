import { defineConfig } from 'astro/config';
import tailwindv4 from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://gromilov.github.io',
  base: '/dinamo/nadir/',
  vite: {
    plugins: [tailwindv4()],
  },
});
