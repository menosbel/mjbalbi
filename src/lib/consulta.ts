import { siteConfig } from '../../site.config.mjs';
import type { Estado } from './obras';

/** Texto y mailto: del botón de Consulta de una Obra, según su Estado. */
export function consultaObra(titulo: string, estado: Estado) {
  const vendida = estado === 'vendida';
  const texto = vendida ? 'Consultar por obras similares' : 'Consultar por esta obra';
  const asunto = vendida ? `Obras similares a «${titulo}»` : `Consulta por la obra «${titulo}»`;
  return { texto, href: mailto(asunto) };
}

/** mailto: al email de la artista con el asunto codificado (tildes, espacios, &, #, %, ?). */
export function mailto(asunto?: string) {
  const destino = `mailto:${siteConfig.email}`;
  return asunto ? `${destino}?subject=${encodeURIComponent(asunto)}` : destino;
}
