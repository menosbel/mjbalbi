import { siteConfig } from '../../site.config.mjs';

/**
 * Internal URL for a site path, with the base path in front.
 * Always use it for links: url('/obras/foo/') → '/mjbalbi/obras/foo/'.
 * (Images from astro:assets already include the base path.)
 */
export function url(path: string) {
  return `${siteConfig.base}/${path.replace(/^\/+/, '')}`;
}

/** Path of an Obra's page. */
export const urlObra = (slug: string) => url(`/obras/${slug}/`);
