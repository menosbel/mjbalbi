// Orden de las Obras en la galería, las páginas de Serie y el inicio (ver #4):
// primero las Disponibles y Reservadas juntas, después las Vendidas; dentro de
// cada grupo, de la más reciente a la más vieja, por año y, si empatan, por
// orden de carga.
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import type { Estado } from './obras';

interface ObraOrdenable {
  id: string;
  filePath?: string;
  data: { estado: Estado; año: number };
}

const grupo = (estado: Estado) => (estado === 'vendida' ? 1 : 0);

/**
 * Una copia de las Obras en el orden de la galería. Sirve para cualquier
 * subconjunto (una Serie, las Destacadas). Último desempate: el slug, para que
 * el orden sea estable.
 */
export function ordenGaleria<T extends ObraOrdenable>(obras: readonly T[]): T[] {
  return [...obras].sort(
    (a, b) =>
      grupo(a.data.estado) - grupo(b.data.estado) ||
      b.data.año - a.data.año ||
      momentoDeCarga(b) - momentoDeCarga(a) ||
      a.id.localeCompare(b.id),
  );
}

const cargas = new Map<string, number>();

/**
 * Cuándo se cargó la Obra: la fecha del commit de git que agregó su archivo
 * Markdown (el contenido vive en git, ver ADR 0001). Un archivo todavía sin
 * commitear es el más nuevo (Infinity). Necesita la historia completa: en CI
 * el checkout se hace con fetch-depth 0.
 */
function momentoDeCarga({ filePath }: ObraOrdenable): number {
  if (!filePath) return Infinity;
  const archivo = resolve(filePath);
  if (!cargas.has(archivo)) cargas.set(archivo, leerDeGit(archivo));
  return cargas.get(archivo)!;
}

function leerDeGit(archivo: string): number {
  try {
    const salida = execFileSync('git', ['log', '--diff-filter=A', '-1', '--format=%ct', '--', archivo], {
      cwd: dirname(archivo),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return salida ? Number(salida) : Infinity;
  } catch {
    // No es un repo de git o no hay git: todas las Obras empatan y decide el slug.
    return Infinity;
  }
}
