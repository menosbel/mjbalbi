import { defineConfig } from 'astro/config';
import { siteConfig } from './site.config.mjs';

export default defineConfig({
  site: siteConfig.url,
  base: siteConfig.base || '/',
  trailingSlash: 'always',
  // Dos Obras con el mismo slug (o dos rutas iguales) hacen fallar el build.
  prerenderConflictBehavior: 'error',
  ...(process.env.ASTRO_CACHE_DIR && { cacheDir: process.env.ASTRO_CACHE_DIR }),
});
