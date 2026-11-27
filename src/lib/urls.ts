import { siteConfig } from '../../site.config.mjs';

/**
 * URL interna de una ruta del sitio, con el base path adelante.
 * Usarla siempre para los links: url('/obras/foo/') → '/mjbalbi/obras/foo/'.
 * (Las imágenes de astro:assets ya incluyen el base path.)
 */
export function url(path: string) {
  return `${siteConfig.base}/${path.replace(/^\/+/, '')}`;
}

/** Ruta de la página de una Obra. */
export const urlObra = (slug: string) => url(`/obras/${slug}/`);

/** Ruta de la página de una Serie. */
export const urlSerie = (slug: string) => url(`/series/${slug}/`);

/** URL del perfil de Instagram de la artista. */
export const urlInstagram = () => `https://www.instagram.com/${siteConfig.instagram}/`;
