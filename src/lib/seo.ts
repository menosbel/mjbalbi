// Metadatos para buscadores y redes (meta description, imagen para compartir,
// JSON-LD) a partir del contenido.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { siteConfig } from '../../site.config.mjs';
import { ETIQUETA_TECNICA, formatMedidas, type Tecnica } from './obras';
import { urlObra } from './urls';

/** URL absoluta de una ruta que ya incluye el base path (url(), Astro.url.pathname, getImage().src). */
export const absoluta = (path: string) => `${siteConfig.url}${path}`;

/**
 * Imagen para compartir en redes: JPG de hasta 1200 px de ancho, el formato y
 * tamaño que aceptan todas. Siempre da la misma URL para la misma foto.
 */
export async function imagenParaCompartir(src: ImageMetadata) {
  const imagen = await getImage({ src, format: 'jpg', width: Math.min(1200, src.width) });
  return { url: absoluta(imagen.src), width: Number(imagen.attributes.width), height: Number(imagen.attributes.height) };
}

/** JSON para un <script type="application/ld+json">, sin '<' que pueda cerrar el script. */
export const serializarJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

/** Markdown → texto plano de una línea (para descriptions y JSON-LD). */
export function textoPlano(markdown = '') {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface DatosObra {
  titulo: string;
  tecnica: Tecnica;
  soporte?: string;
  medidas: { alto: number; ancho: number; profundidad?: number };
  año: number;
}

/** "Atardecer en el río, de María Julia Balbi. Óleo sobre lienzo, 60 × 80 × 3 cm, 2024. <descripción>" */
export function descripcionObra({ titulo, tecnica, soporte, medidas, año }: DatosObra, cuerpo?: string) {
  const tecnicaYSoporte = ETIQUETA_TECNICA[tecnica] + (soporte ? ` sobre ${soporte}` : '');
  const ficha = `${titulo}, de ${siteConfig.artista}. ${tecnicaYSoporte}, ${formatMedidas(medidas)}, ${año}.`;
  const texto = textoPlano(cuerpo);
  return texto ? `${ficha} ${texto}` : ficha;
}

/**
 * Props de SEO para el <Base> de la página de una Obra:
 * <Base title={titulo} {...await seoObra(obra.id, obra.data, obra.body)}>
 */
export async function seoObra(slug: string, data: DatosObra & { fotos: { src: ImageMetadata; alt: string }[] }, cuerpo?: string) {
  const principal = data.fotos[0];
  const imagen = await imagenParaCompartir(principal.src);
  return {
    description: descripcionObra(data, cuerpo),
    image: principal,
    type: 'article',
    jsonLd: jsonLdObra(data, { url: absoluta(urlObra(slug)), imagen: imagen.url, cuerpo }),
  };
}

const cm = (value: number) => ({ '@type': 'QuantitativeValue', value, unitCode: 'CMT', unitText: 'cm' });
const capitalizar = (texto: string) => texto.charAt(0).toLocaleUpperCase('es') + texto.slice(1);

/** JSON-LD schema.org VisualArtwork de una Obra. Omite los campos que la Obra no tiene. */
export function jsonLdObra(
  { titulo, tecnica, soporte, medidas, año }: DatosObra,
  { url, imagen, cuerpo }: { url: string; imagen: string; cuerpo?: string },
) {
  const descripcion = textoPlano(cuerpo);
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: titulo,
    url,
    image: imagen,
    creator: { '@type': 'Person', name: siteConfig.artista },
    artform: 'Pintura',
    artMedium: ETIQUETA_TECNICA[tecnica],
    ...(soporte && { artworkSurface: capitalizar(soporte) }),
    height: cm(medidas.alto),
    width: cm(medidas.ancho),
    ...(medidas.profundidad !== undefined && { depth: cm(medidas.profundidad) }),
    dateCreated: String(año),
    ...(descripcion && { description: descripcion }),
  };
}
