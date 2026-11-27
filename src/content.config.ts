import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { siteConfig } from '../site.config.mjs';
import { ESTADOS, TECNICAS } from './lib/obras';

const contentDir = (collection: string) => `${siteConfig.contentDir.replace(/\/+$/, '')}/${collection}`;

// Cada Obra es `obras/<slug>.md` o `obras/<slug>/index.md`, con sus fotos al lado.
// El slug sale del nombre del archivo o carpeta.
const obras = defineCollection({
  loader: glob({ pattern: ['*.md', '*/index.md'], base: contentDir('obras') }),
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
    }),
});

export const collections = { obras };
