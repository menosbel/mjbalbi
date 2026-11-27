import type { Estado } from './obras';

type ObraOrdenable = { id: string; data: { estado: Estado; año: number } };

/**
 * Gallery order: Disponibles and Reservadas first, then Vendidas; within each
 * group from newest to oldest (año), ties by slug so the order is stable.
 */
export function ordenGaleria<T extends ObraOrdenable>(obras: T[]): T[] {
  const grupo = (obra: T) => (obra.data.estado === 'vendida' ? 1 : 0);
  return [...obras].sort(
    (a, b) => grupo(a) - grupo(b) || b.data.año - a.data.año || a.id.localeCompare(b.id),
  );
}
