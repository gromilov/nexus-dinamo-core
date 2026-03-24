import { defineConfig } from 'astro/config';
import tailwindv4 from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  base: '/syndicate-spore-core/sites/finalnexus/',
  vite: {
    plugins: [tailwindv4()],
  },
});
