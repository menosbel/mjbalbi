// Datos de contacto y de identidad del sitio. Es el único lugar donde se cargan.

export const ARTISTA = {
  nombre: 'María Julia Balbi',
  // TODO: reemplazar por el email real de la artista.
  email: 'contacto@mjbalbi.com',
  instagram: 'mjbalbi.arte',
  // TODO: confirmar ciudad y país, se usan en los datos estructurados (SEO/GEO).
  ciudad: 'Buenos Aires',
  pais: 'Argentina',
} as const;

export const INSTAGRAM_URL = `https://www.instagram.com/${ARTISTA.instagram}/`;

export const SITIO = {
  titulo: `${ARTISTA.nombre} · Pinturas al óleo, acrílico y pastel`,
  descripcion: `Obras originales de ${ARTISTA.nombre}: pinturas al óleo, acrílico y pastel disponibles para la venta. Consultá precio y disponibilidad por email.`,
  locale: 'es_AR',
};

export const TECNICAS = {
  oleo: { nombre: 'Óleo', plural: 'Pinturas al óleo' },
  acrilico: { nombre: 'Acrílico', plural: 'Pinturas en acrílico' },
  pastel: { nombre: 'Pastel', plural: 'Obras en pastel' },
} as const;

export type Tecnica = keyof typeof TECNICAS;

export const ESTADOS = {
  disponible: 'Disponible',
  reservada: 'Reservada',
  vendida: 'Vendida',
} as const;
