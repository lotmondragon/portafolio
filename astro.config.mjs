// @ts-check
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Sin dominio propio todavía: se despliega en el subdominio *.vercel.app.
// Actualiza este valor en cuanto tengas un dominio (ver README → Desplegar).
const site = process.env.SITE_URL ?? 'https://portafolio-blush-ten-37.vercel.app';

// Heurística ligera para no listar /notas en el sitemap mientras la
// colección esté vacía (solo el archivo plantilla _ejemplo.mdx.txt, que no
// cuenta). No sustituye el filtro por `borrador` que ya hace notas/index.astro
// al renderizar — esto solo evita una entrada de sitemap apuntando a una
// página que decide devolver 404.
const notasDir = fileURLToPath(new URL('./src/content/notas', import.meta.url));
const hasAnyNotaFile = existsSync(notasDir) && readdirSync(notasDir).some((f) => f.endsWith('.mdx'));

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => hasAnyNotaFile || !page.includes('/notas'),
    }),
  ],
});
