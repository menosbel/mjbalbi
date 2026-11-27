// Configuración del sitio: el único lugar donde se cambian los datos que
// dependen de dónde y cómo se publica. Lo leen astro.config.mjs, el esquema
// de contenido y los componentes (import { siteConfig } from '…/site.config.mjs').
//
// Algunos valores se pueden pisar con variables de entorno, para los tests y
// para publicar en otro lugar sin tocar el código:
//   SITE_URL     URL del sitio, sin base path    (https://menosbel.github.io)
//   SITE_BASE    base path: '/mjbalbi' en Pages, '' con dominio propio
//   CONTENT_DIR  directorio del contenido (los tests apuntan a test/fixtures/…)
//   SITE_INDEXAR 'true' permite que los buscadores indexen el sitio
//   GOATCOUNTER  código de GoatCounter

const env = process.env;

export const siteConfig = {
  /** URL absoluta del sitio, sin base path ni barra final. */
  url: stripTrailingSlash(env.SITE_URL ?? 'https://menosbel.github.io'),
  /** Base path: '' o '/algo', sin barra final. */
  base: normalizeBase(env.SITE_BASE ?? '/mjbalbi'),
  /** Directorio con las carpetas de contenido (obras/, …), relativo a la raíz o absoluto. */
  contentDir: env.CONTENT_DIR ?? './contenido',
  /** Nombre de la artista, para títulos y metadatos. */
  artista: 'María Julia Balbi',
  /**
   * Si los buscadores pueden indexar el sitio. false (por defecto): todas las
   * páginas llevan <meta name="robots" content="noindex"> y robots.txt prohíbe
   * rastrear. Se activa al publicar con el dominio definitivo.
   */
  indexar: env.SITE_INDEXAR === 'true',
  /**
   * Código de GoatCounter (el "xxx" de xxx.goatcounter.com). Vacío: no se
   * incluye el script de analítica.
   */
  goatcounter: env.GOATCOUNTER ?? '',
  /** Descripción del sitio: meta description de las páginas que no tienen una propia. */
  descripcion: 'Obras originales de María Julia Balbi: óleos, acrílicos y pasteles.',
  /** Email de la artista: destino de las Consultas y del pie. */
  // TODO: reemplazar por el email real de la artista (todavía no lo tenemos).
  email: 'contacto@example.com',
  /** Usuario de Instagram, sin @. */
  instagram: 'mjbalbi.arte',
};

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function normalizeBase(value) {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '';
}
