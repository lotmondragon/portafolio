// Genera public/og.png (1200x630), una sola imagen OG para todo el sitio,
// respetando los tokens del sistema (color, tipografía). No corre en
// producción ni se importa desde el sitio — es una utilidad de build que se
// ejecuta a mano cuando cambia el copy de la imagen: `node scripts/generate-og.mjs`.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { decompress } from 'wawoff2';

const root = fileURLToPath(new URL('..', import.meta.url));
const fontPath = (p) => new URL(p, `file://${root}/`);

// satori solo lee TTF/OTF; los paquetes @fontsource sirven woff2, así que se
// descomprimen a TTF una vez, en memoria, antes de pasarlos a satori.
const loadTtf = async (p) => Buffer.from(await decompress(await readFile(fontPath(p))));

const [frauncesRegular, instrumentRegular, jetbrainsRegular] = await Promise.all([
  // Corte estático (no variable): el parser de fuentes de satori no soporta
  // la tabla fvar de 4 ejes de la Fraunces variable que sí usa el sitio.
  loadTtf('node_modules/@fontsource/fraunces/files/fraunces-latin-400-normal.woff2'),
  loadTtf('node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff2'),
  loadTtf('node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2'),
]);

const COLOR_BG = '#FAF9F6';
const COLOR_INK = '#1A1A18';
const COLOR_INK_BODY = '#33322D';
const COLOR_META = '#605F59';
const COLOR_BORDER = '#E4E1DA';
const COLOR_ACCENT = '#2F6A4F'; // aproximación sRGB de oklch(0.42 0.075 155) para el renderer SVG

const node = {
  type: 'div',
  props: {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: COLOR_BG,
      border: `1px solid ${COLOR_BORDER}`,
      padding: '72px',
      fontFamily: 'Instrument Sans',
    },
    children: [
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          },
          children: [
            { type: 'div', props: { style: { width: '28px', height: '4px', background: COLOR_ACCENT } } },
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'JetBrains Mono',
                  fontSize: '22px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: COLOR_META,
                  display: 'flex',
                },
                children: 'Portafolio — Lot Mondragón',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column' },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'Fraunces',
                  fontWeight: 400,
                  fontSize: '104px',
                  lineHeight: 1.05,
                  color: COLOR_INK,
                  display: 'flex',
                },
                children: 'Lot Mondragón',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'Instrument Sans',
                  fontSize: '32px',
                  lineHeight: 1.4,
                  color: COLOR_INK_BODY,
                  marginTop: '28px',
                  maxWidth: '900px',
                  display: 'flex',
                },
                children: 'Modernizo sistemas empresariales que llevan más de una década en producción.',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: {
            fontFamily: 'JetBrains Mono',
            fontSize: '20px',
            letterSpacing: '0.02em',
            color: COLOR_META,
            display: 'flex',
          },
          children: 'Querétaro, México · .NET · Angular · GeneXus',
        },
      },
    ],
  },
};

const svg = await satori(node, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Fraunces', data: frauncesRegular, weight: 400, style: 'normal' },
    { name: 'Instrument Sans', data: instrumentRegular, weight: 400, style: 'normal' },
    { name: 'JetBrains Mono', data: jetbrainsRegular, weight: 500, style: 'normal' },
  ],
});

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
const png = resvg.render().asPng();

await writeFile(new URL('public/og.png', `file://${root}/`), png);
console.log('public/og.png generado');
