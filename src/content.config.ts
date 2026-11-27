import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { siteConfig } from '../site.config.mjs';
import { ESTADOS, TECNICAS } from './lib/obras';
import { globPorSlug } from './lib/slugs';

const contentDir = (collection: string) => `${siteConfig.contentDir.replace(/\/+$/, '')}/${collection}`;

// Cada Obra es `obras/<slug>.md` o `obras/<slug>/index.md`, con sus fotos al lado.
const obras = defineCollection({
  loader: globPorSlug({ base: contentDir('obras'), coleccion: 'obras' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string().min(1),
      fotos: z
        .array(
          z.object({
            src: image(),
            alt: z.string().trim().min(1, 'Cada foto necesita texto alternativo (alt)'),
          }),
        )
        .min(1, 'La Obra necesita al menos una foto'),
      medidas: z.object({
        alto: z.number().positive(),
        ancho: z.number().positive(),
        profundidad: z.number().positive().optional(),
      }),
      tecnica: z.enum(TECNICAS),
      soporte: z.string().min(1).optional(),
      año: z.number().int(),
      enmarcada: z.boolean().optional(),
      estado: z.enum(ESTADOS),
      destacada: z.boolean().default(false),
      serie: reference('series').optional(),
    }),
});

// Cada Serie es `series/<slug>.md` o `series/<slug>/index.md`; el cuerpo es el texto de la artista.
const series = defineCollection({
  loader: globPorSlug({ base: contentDir('series'), coleccion: 'series' }),
  schema: z.object({
    nombre: z.string().min(1),
  }),
});

export const collections = { obras, series };
