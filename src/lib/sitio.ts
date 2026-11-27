import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { ARTISTA, INSTAGRAM_URL, TECNICAS } from '../config';

export type Obra = CollectionEntry<'obras'>;
export type Serie = CollectionEntry<'series'>;

/** Ruta interna con el `base` del sitio (p. ej. /mjbalbi/obras/). */
export function url(ruta = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpia = ruta.replace(/^\//, '');
  return `${base}/${limpia}`;
}

/** URL absoluta, para canonical, Open Graph y datos estructurados. */
export function urlAbsoluta(ruta: string, site: URL | undefined): string {
  return new URL(ruta, site).href;
}

const porOrden = <T extends { data: { orden: number } }>(a: T, b: T) => a.data.orden - b.data.orden;

export async function obras(): Promise<Obra[]> {
  return (await getCollection('obras')).sort(porOrden);
}

export async function series(): Promise<Serie[]> {
  return (await getCollection('series')).sort(porOrden);
}

export async function artista() {
  const entrada = await getEntry('artista', 'artista');
  if (!entrada) throw new Error('Falta src/content/artista.md');
  return entrada;
}

export const urlObra = (obra: Obra) => url(`/obras/${obra.id}/`);
export const urlSerie = (serie: Serie) => url(`/series/${serie.id}/`);
export const urlTecnica = (tecnica: keyof typeof TECNICAS) => url(`/obras/${tecnica}/`);

const cm = (n: number) => n.toLocaleString('es-AR');

/** "80 × 100 cm" (ancho × alto, como se informa habitualmente en obra). */
export const medidas = (obra: Obra) => `${cm(obra.data.ancho)} × ${cm(obra.data.alto)} cm`;

/** "Óleo sobre lienzo" */
export const tecnicaYSoporte = (obra: Obra) =>
  `${TECNICAS[obra.data.tecnica].nombre} sobre ${obra.data.soporte.toLowerCase()}`;

/** Enlace mailto para iniciar una Consulta, con asunto y cuerpo precargados. */
export function mailtoConsulta(obra?: Obra, urlPagina?: string): string {
  const asunto = obra ? `Consulta por "${obra.data.titulo}"` : 'Consulta desde el sitio';
  const cuerpo = obra
    ? `Hola María Julia, me interesa la obra "${obra.data.titulo}" (${tecnicaYSoporte(obra)}, ${medidas(obra)}).\n${urlPagina ?? ''}\n\n¿Me podrías contar precio y disponibilidad?\n\nGracias.`
    : 'Hola María Julia, ';
  return `mailto:${ARTISTA.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

/** Nodo Person de schema.org, referenciado desde el resto de los datos estructurados. */
export function personaJsonLd(site: URL | undefined, resumen?: string) {
  return {
    '@type': 'Person',
    '@id': urlAbsoluta(url('/#artista'), site),
    name: ARTISTA.nombre,
    jobTitle: 'Artista plástica',
    description: resumen,
    url: urlAbsoluta(url('/'), site),
    email: `mailto:${ARTISTA.email}`,
    sameAs: [INSTAGRAM_URL],
    knowsAbout: ['Pintura al óleo', 'Pintura acrílica', 'Pastel', 'Arte contemporáneo'],
    address: { '@type': 'PostalAddress', addressLocality: ARTISTA.ciudad, addressCountry: ARTISTA.pais },
  };
}
