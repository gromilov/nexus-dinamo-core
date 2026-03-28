import { defineConfig } from 'astro/config';
import tailwindv4 from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://dinamo.saitik.su',
  base: '/nadir/',
  ssr: {
    noExternal: ['mp4-muxer'],
  },
  vite: {
    plugins: [tailwindv4()],
  },
});
