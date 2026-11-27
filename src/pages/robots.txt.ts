import type { APIRoute } from 'astro';

// Se permite el acceso a todos, incluidos los rastreadores de asistentes de IA:
// que puedan citar y recomendar las obras es parte del objetivo (GEO).
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`);
};
