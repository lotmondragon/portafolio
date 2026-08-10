# Portafolio — Lot Mondragón

Sitio de portafolio personal. Astro (TypeScript strict), MDX vía content
collections, CSS plano con custom properties para el sistema de diseño.

**Movimiento:** el brief original pedía cero animación de scroll y cero JS
más allá del toggle de tema. Se relajó deliberadamente en la home después
de ver que el resultado se sentía plano — ver "Dirección de movimiento"
más abajo para qué cambió y por qué. Las páginas de proyecto y nota siguen
siendo 100% estáticas.

## Correr en local

Requiere Node 22.12 o superior.

```sh
npm install
npm run dev
```

Abre `http://localhost:4321`.

```sh
npm run build     # build de producción a ./dist
npm run preview   # sirve ese build localmente
npx astro check   # chequeo de tipos
```

## Agregar un proyecto

Cada proyecto es un archivo en `src/content/proyectos/`, nombrado
`NN-slug.mdx` (el prefijo `NN-` solo ordena los archivos en el filesystem;
la URL pública sale del slug, sin el prefijo — `02-adminsme-mexico.mdx` se
sirve en `/proyectos/adminsme-mexico/`).

Copia uno de los archivos existentes como plantilla. El schema completo
(`src/content.config.ts`) es:

```ts
titulo: string
numero: string          // "01", "02"... para el índice de la home
anio: number
rol: string
stack: string[]
estado: string
enlaces: { repo?, sitio?, caseStudy? }   // urls, todas opcionales
resumen: string
problema: string[]      // uno o más párrafos
decisiones: {
  titulo, contexto, opciones, eleccion, costo: string
}[]
capturas: {              // opcional — si se omite, la sección no se renderiza
  src: image, alt: string, pie?: string,
  tipo: 'antes' | 'despues' | 'completa'
}[]
resultado: string[]
```

Notas sobre `capturas`:

- Las imágenes van en `src/assets/screenshots/<proyecto>/` y se referencian
  con ruta relativa (`../../assets/screenshots/...`) — nunca remotas.
- Un `tipo: 'antes'` seguido de un `tipo: 'despues'` se muestra como par
  lado a lado (apilado en móvil). Cualquier otro caso (`completa`, o un
  `antes`/`despues` sin pareja) se muestra a ancho completo.
- `alt` es obligatorio y tiene que describir la imagen, no decir "captura
  de pantalla".
- Si el proyecto no tiene capturas todavía, omite el campo por completo —
  la sección simplemente no aparece.

## Agregar una nota

```sh
cp src/content/notas/_ejemplo.mdx.txt src/content/notas/mi-nota.mdx
```

Edita el frontmatter (`titulo`, `fecha`, `resumen`, `borrador`) y escribe la
nota en Markdown debajo. Mientras `borrador: true`, la nota se ve en
`npm run dev` pero no se publica (`npm run build` la excluye).

En cuanto haya al menos una nota con `borrador: false`, el enlace "Notas" en
la navegación y la sección de la home aparecen solos — no hay que tocar
ningún componente ni activar nada a mano.

El tiempo de lectura se calcula solo (conteo de palabras), no se captura.

> Si acabas de agregar el primer archivo `.mdx` a `src/content/notas/` y
> `npm run dev` no lo detecta de inmediato, reinicia el servidor
> (`Ctrl+C` y `npm run dev` de nuevo). Es una particularidad del watcher de
> contenido con archivos nuevos — `npm run build` siempre sincroniza en
> limpio, así que no afecta al sitio publicado.

## Actualizar el CV

Reemplaza `public/cv.pdf` por el archivo nuevo, mismo nombre. Se sirve tal
cual en `/cv.pdf` y es el destino del enlace "CV en PDF ↓" de la home.

## Actualizar la imagen OG

Hay una sola imagen Open Graph para todo el sitio (`public/og.png`),
generada a partir de un layout en `scripts/generate-og.mjs` que usa los
mismos tokens de color y tipografía que el resto del sitio. Si cambias el
copy o el diseño de esa imagen:

```sh
npm run generate-og
```

## Dirección de movimiento

El sistema original ("documentación técnica, bien tipografiada") pedía
explícitamente cero animación de scroll y cero JS salvo el toggle de tema.
Después de ver el resultado, se relajó esa regla en la home — el resto del
sitio (proyectos, notas) sigue sin JS más allá del toggle. Lo que cambió,
y por qué es "cero JS extra" y no "todo vale":

- **Entrada del hero**: el titular se dibuja una vez al cargar (`clip-path`,
  ~480ms) y el resto sube en cascada corta — nunca se dispara por scroll,
  solo por carga de página. Dura menos de 700ms en total a propósito, para
  no penalizar el LCP (verificado con Lighthouse antes/después: mismo
  score). Es puro CSS — cero JS.
- **Papel milimetrado** detrás del hero: textura CSS, referencia directa al
  concepto de "plano técnico", no decoración genérica.
- **Firma por proyecto**: cada fila del índice revela al hover una
  polilínea distinta, generada en build a partir del slug del proyecto
  (`ProjectRow.astro`) — determinística, no aleatoria, y cero JS de
  cliente: es SVG estático renderizado en el servidor.
- **Subrayados que se trazan** al hover/foco (`.link-draw` en
  `base.css`) en vez de aparecer de golpe — puro CSS.
- **Lector de coordenadas del cursor** (`CoordsReadout.astro`, solo en
  home): el único añadido que sí es JS nuevo más allá del toggle de tema.
  Un detalle de instrumento, no decorativo; se oculta en touch
  (`pointer: fine`) y no roba foco ni clics.
- **View Transitions nativas** (`<ClientRouter />` de Astro) para
  morphing suave entre páginas — es una API del navegador que Astro
  activa de forma declarativa, no una librería ni JS que se escribió a
  mano. Importante si tocas el toggle de tema o agregas otro script: con
  ClientRouter activo, `<html data-theme>` no sobrevive una transición
  por sí solo — hay un listener de `astro:before-swap` en
  `BaseLayout.astro` que lo copia al documento entrante, y los scripts de
  cliente (`ThemeToggle.astro`, `CoordsReadout.astro`) se inicializan en
  `astro:page-load`, no en el top level del módulo, porque ese top level
  solo corre una vez por sesión de navegación, no en cada transición.

Todo esto se probó con Lighthouse (desktop y el perfil móvil por defecto)
contra el build de producción real antes de darlo por terminado — sigue en
100/100/100/100 en móvil.

`prefers-reduced-motion` sigue desactivando toda animación no esencial
(regla global en `base.css`) — con eso activo, el hero aparece completo de
inmediato, sin el trazado.

## Dependencias y por qué están

- **Astro** — SSG con content collections nativas y cero JS por defecto.
- **@astrojs/mdx** — las notas y proyectos son `.mdx`.
- **@astrojs/sitemap** — genera `sitemap-index.xml`.
- **@fontsource-variable/fraunces**, **@fontsource/instrument-sans**,
  **@fontsource/jetbrains-mono** — las tres fuentes del sistema,
  autoalojadas (sin Google Fonts por CDN). Fraunces se usa en su build
  variable para conservar el eje óptico (`opsz`) que el diseño original usa
  vía Google Fonts variable.
- **satori**, **@resvg/resvg-js**, **wawoff2** (solo `devDependencies`) —
  usadas únicamente por `scripts/generate-og.mjs` para renderizar la imagen
  OG estática con las fuentes reales del sistema. No se incluyen en el
  bundle del sitio ni se ejecutan en producción.
- El resto de la interactividad (`astro:assets` para imágenes, el toggle de
  tema) no requiere ninguna librería adicional — es un `<script>` de
  cliente de ~15 líneas, sin isla de framework.

## Desplegar en Vercel

El sitio es 100% estático — no necesita variables de entorno ni runtime de
servidor.

```sh
npm i -g vercel   # si no lo tienes
vercel login
vercel            # deploy de preview, la primera vez pregunta y crea el proyecto
vercel --prod     # deploy de producción
```

O desde el dashboard de Vercel: **Add New → Project**, importa el
repositorio `lotmondragon/portafolio` — Vercel detecta Astro
automáticamente (framework preset "Astro", build command `astro build`,
output `dist`). No hace falta tocar nada más.

### Conectar un dominio propio

El sitio se desplegó inicialmente sin dominio propio, en el subdominio
`*.vercel.app`. Cuando tengas un dominio:

1. En el dashboard del proyecto → **Settings → Domains** → agrega el
   dominio.
2. Sigue las instrucciones de Vercel para apuntar los DNS (un registro `A`
   a la IP de Vercel, o un `CNAME` si es un subdominio) desde donde
   compraste el dominio.
3. Actualiza `astro.config.mjs`: cambia la constante `site` al dominio
   nuevo (se usa para generar URLs canónicas, el sitemap y las etiquetas
   Open Graph). Redeploy.

## Estructura

```
src/
  content.config.ts      # schemas de proyectos y notas
  content/
    proyectos/*.mdx
    notas/*.mdx
  components/             # piezas de UI reutilizables
  layouts/                 # BaseLayout, ProjectLayout, NoteLayout
  pages/                   # rutas del sitio
  lib/                     # config central + helpers (notas publicadas, slugs, etc.)
  styles/                  # tokens.css, reset.css, base.css, fonts.css, article.css
  assets/                  # logos y capturas, optimizados por astro:assets
```
