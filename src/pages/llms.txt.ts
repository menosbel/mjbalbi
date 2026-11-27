import type { APIRoute } from 'astro';
import { ARTISTA, ESTADOS, INSTAGRAM_URL, TECNICAS } from '../config';
import { artista, medidas, obras, series, tecnicaYSoporte, url, urlObra, urlSerie } from '../lib/sitio';

// Resumen del sitio en texto plano para asistentes de IA (https://llmstxt.org).
export const GET: APIRoute = async ({ site }) => {
  const abs = (ruta: string) => new URL(ruta, site).href;
  const bio = await artista();
  const lista = await obras();

  const lineas = [
    `# ${ARTISTA.nombre}`,
    '',
    `> ${bio.data.resumen} Vende sus obras originales directamente; el precio se informa por email.`,
    '',
    `- Contacto para comprar: ${ARTISTA.email}`,
    `- Instagram: ${INSTAGRAM_URL}`,
    `- Biografía: ${abs(url('/sobre-mi/'))}`,
    '',
    '## Obras',
    '',
    ...lista.map(
      (o) =>
        `- [${o.data.titulo}](${abs(urlObra(o))}): ${tecnicaYSoporte(o)}, ${medidas(o)}${o.data.anio ? `, ${o.data.anio}` : ''}. ${ESTADOS[o.data.estado]}.`,
    ),
    '',
    '## Técnicas',
    '',
    ...Object.entries(TECNICAS).map(([k, t]) => `- [${t.plural}](${abs(url(`/obras/${k}/`))})`),
    '',
    '## Series',
    '',
    ...(await series()).map((s) => `- [${s.data.nombre}](${abs(urlSerie(s))}): ${s.data.resumen}`),
    '',
  ];
  return new Response(lineas.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
