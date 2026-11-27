// robots.txt según siteConfig.indexar. Se publica bajo el base path: los
// buscadores solo lo leen en la raíz del dominio, así que cuenta de verdad
// con dominio propio (base ''); el noindex de cada página vale siempre.
import type { APIRoute } from 'astro';
import { siteConfig } from '../../site.config.mjs';
import { absoluta } from '../lib/seo';
import { url } from '../lib/urls';

export const GET: APIRoute = () => {
  const lineas = siteConfig.indexar
    ? ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluta(url('/sitemap-index.xml'))}`]
    : ['User-agent: *', 'Disallow: /'];
  return new Response(`${lineas.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
