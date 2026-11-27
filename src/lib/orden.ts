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
 * A sorted copy of the Obras, in gallery order. Works on any subset (a Serie,
 * the Destacadas). Last resort tie-break: the slug, so the order is stable.
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
 * When the Obra was loaded: the time of the git commit that added its Markdown
 * file (content lives in git, see ADR 0001). A file not committed yet is the
 * newest (Infinity). Needs the full history: CI checks out with fetch-depth 0.
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
    // Not a git repo or no git: every Obra ties and the slug decides.
    return Infinity;
  }
}
