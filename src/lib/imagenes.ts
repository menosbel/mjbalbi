// Tamaños de las fotos para el srcset de <Picture>.
import type { Foto } from './obras';

/**
 * Los anchos del srcset de una foto: los de `anchos` menores que el original y,
 * al final, el original, recortado a `anchoMaximo`. Nunca se agranda una foto.
 */
export function anchosResponsivos(foto: Foto, anchos: readonly number[], anchoMaximo = Infinity) {
  const tope = Math.min(foto.src.width, anchoMaximo);
  return [...anchos.filter((ancho) => ancho < tope), tope];
}
