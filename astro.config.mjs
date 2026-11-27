// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Mientras el sitio viva en GitHub Pages, la URL pública es
// https://menosbel.github.io/mjbalbi/. Con un dominio propio, cambiar `site`
// por el dominio y borrar `base`.
export default defineConfig({
  site: 'https://menosbel.github.io',
  base: '/mjbalbi',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
