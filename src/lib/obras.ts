// Vocabulario de las Obras (ver GLOSSARY.md): valores válidos, sus textos
// visibles, los tipos de los datos de una Obra y consultas sobre listas de Obras.
import type { CollectionEntry } from 'astro:content';

export const TECNICAS = ['óleo', 'acrílico', 'pastel'] as const;
export type Tecnica = (typeof TECNICAS)[number];

export const ESTADOS = ['disponible', 'reservada', 'vendida'] as const;
export type Estado = (typeof ESTADOS)[number];

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  disponible: 'Disponible',
  reservada: 'Reservada',
  vendida: 'Vendida',
};

export const ETIQUETA_TECNICA: Record<Tecnica, string> = {
  óleo: 'Óleo',
  acrílico: 'Acrílico',
  pastel: 'Pastel',
};

// Tipos de los datos de una Obra, inferidos del esquema de contenido (content.config.ts).
export type DatosObra = CollectionEntry<'obras'>['data'];
/** { alto, ancho, profundidad? } en cm. */
export type Medidas = DatosObra['medidas'];
/** { src: ImageMetadata, alt } */
export type Foto = DatosObra['fotos'][number];

/** "60 × 80 cm" o "60 × 80 × 3 cm" (alto × ancho × profundidad). */
export function formatMedidas({ alto, ancho, profundidad }: Medidas) {
  const partes = [alto, ancho, profundidad].filter((n) => n !== undefined);
  return `${partes.map(formatNumero).join(' × ')} cm`;
}

const formatNumero = (n: number) => n.toLocaleString('es-AR');

/** El Soporte como se muestra: con mayúscula inicial ('lienzo' → 'Lienzo'). */
export const formatSoporte = (soporte: string) => soporte.charAt(0).toLocaleUpperCase('es') + soporte.slice(1);

interface ObraConDatos {
  data: { tecnica: Tecnica; serie?: { id: string } };
}

/** Las Obras de una Serie, en el mismo orden en que vienen. */
export const obrasDeSerie = <T extends ObraConDatos>(obras: readonly T[], serie: string) =>
  obras.filter((o) => o.data.serie?.id === serie);

/** Las Técnicas con al menos una Obra, en el orden de TECNICAS. */
export const tecnicasConObras = (obras: readonly ObraConDatos[]) =>
  TECNICAS.filter((t) => obras.some((o) => o.data.tecnica === t));
