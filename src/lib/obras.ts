// Vocabulario de las Obras (ver GLOSSARY.md): valores válidos y sus textos visibles.

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

/** "60 × 80 cm" o "60 × 80 × 3 cm" (alto × ancho × profundidad). */
export function formatMedidas({ alto, ancho, profundidad }: { alto: number; ancho: number; profundidad?: number }) {
  const partes = [alto, ancho, profundidad].filter((n) => n !== undefined);
  return `${partes.map(formatNumero).join(' × ')} cm`;
}

const formatNumero = (n: number) => n.toLocaleString('es-AR');
