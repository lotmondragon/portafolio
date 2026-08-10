import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const decision = z.object({
  titulo: z.string(),
  contexto: z.string(),
  opciones: z.string(),
  eleccion: z.string(),
  costo: z.string(),
});

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/proyectos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      numero: z.string(),
      resumen: z.string(),
      anio: z.number(),
      rol: z.string(),
      stack: z.array(z.string()),
      estado: z.string(),
      enlaces: z
        .object({
          repo: z.string().url().optional(),
          sitio: z.string().url().optional(),
          caseStudy: z.string().url().optional(),
        })
        .default({}),
      problema: z.array(z.string()),
      decisiones: z.array(decision),
      capturas: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            pie: z.string().optional(),
            tipo: z.enum(['antes', 'despues', 'completa']),
          }),
        )
        .default([]),
      resultado: z.array(z.string()),
    }),
});

const notas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notas' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.date(),
    resumen: z.string(),
    borrador: z.boolean().default(false),
  }),
});

export const collections = { proyectos, notas };
