import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://chanweii.github.io',
  output: 'static',
  outDir: './dist',
  // Preserve the original HTML's inline spacing during the migration.
  compressHTML: false,
  vite: {
    plugins: [tailwindcss()],
  },
});
