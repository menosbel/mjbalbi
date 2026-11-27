import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada Obra es una carpeta en src/content/obras/<slug>/ con index.md y su foto.
const obras = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/obras', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      foto: image(),
      // Texto alternativo: describe lo que se ve en la Obra (accesibilidad y SEO de imágenes).
      alt: z.string(),
      tecnica: z.enum(['oleo', 'acrilico', 'pastel']),
      soporte: z.string(),
      // Medidas en centímetros.
      alto: z.number().positive(),
      ancho: z.number().positive(),
      anio: z.number().int().optional(),
      serie: reference('series').optional(),
      estado: z.enum(['disponible', 'reservada', 'vendida']).default('disponible'),
      destacada: z.boolean().default(false),
      // Orden manual dentro de los listados: menor primero.
      orden: z.number().default(100),
    }),
});

const series = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/series' }),
  schema: z.object({
    nombre: z.string(),
    resumen: z.string(),
    orden: z.number().default(100),
  }),
});

// Una única entrada (artista.md): el cuerpo es la biografía.
const artista = defineCollection({
  loader: glob({ pattern: 'artista.md', base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      resumen: z.string(),
      retrato: image().optional(),
      statement: z.string(),
      trayectoria: z
        .array(z.object({ anio: z.string(), texto: z.string() }))
        .default([]),
    }),
});

export const collections = { obras, series, artista };
