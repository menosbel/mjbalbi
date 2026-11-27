// Filtros de la galería: cada filtro es una vista estática de /obras/ con solo
// las Obras de una Técnica o de una Serie. Sin JS, son links comunes.
import { getCollection, type CollectionEntry } from 'astro:content';
import { ETIQUETA_TECNICA, obrasDeSerie, tecnicasConObras, type Tecnica } from './obras';
import { url } from './urls';

/** Slug de una Técnica para la URL: 'acrílico' → 'acrilico'. */
export const slugTecnica = (tecnica: Tecnica) => tecnica.normalize('NFD').replace(/\p{Diacritic}/gu, '');

export const urlFiltroTecnica = (tecnica: Tecnica) => url(`/obras/tecnica/${slugTecnica(tecnica)}/`);
export const urlFiltroSerie = (slug: string) => url(`/obras/serie/${slug}/`);

export interface Filtro {
  texto: string;
  href: string;
}

/** Las Series con al menos una Obra, por nombre. */
export async function seriesConObras(obras: CollectionEntry<'obras'>[]) {
  return (await getCollection('series'))
    .filter((s) => obrasDeSerie(obras, s.id).length > 0)
    .sort((a, b) => a.data.nombre.localeCompare(b.data.nombre, 'es'));
}

/**
 * Los filtros que ofrece la galería: Todas, cada Técnica con alguna Obra (en el
 * orden de TECNICAS) y cada Serie con alguna Obra (por nombre).
 */
export async function filtrosGaleria(obras: CollectionEntry<'obras'>[]): Promise<Filtro[]> {
  const tecnicas = tecnicasConObras(obras);
  const series = await seriesConObras(obras);
  return [
    { texto: 'Todas', href: url('/obras/') },
    ...tecnicas.map((t) => ({ texto: ETIQUETA_TECNICA[t], href: urlFiltroTecnica(t) })),
    ...series.map((s) => ({ texto: s.data.nombre, href: urlFiltroSerie(s.id) })),
  ];
}
