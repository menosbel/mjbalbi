import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite, reglasCss } from './harness.mjs';

/** Tokens de color de :root ({ '--color-fondo': '#faf8f4', … }). */
function tokens(reglas) {
  const result = {};
  for (const r of reglas.filter((r) => r.selector === ':root')) {
    for (const [, nombre, valor] of r.cuerpo.matchAll(/(--color-[\w-]+):\s*(#[0-9a-f]{3,6})\b/gi)) {
      result[nombre] = valor.toLowerCase();
    }
  }
  return result;
}

/** Relación de contraste WCAG 2 entre dos colores #rrggbb o #rgb. */
function contraste(a, b) {
  const luminancia = (hex) => {
    const h = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, (c) => c + c) : hex;
    const [r, g, bl] = [1, 3, 5]
      .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

/** Declaraciones (sin @media) de las reglas cuyo selector menciona `clase`. */
const declaraciones = (reglas, clase) =>
  reglas
    .filter((r) => r.media === null && r.selector.split(',').some((s) => s.includes(clase)))
    .map((r) => r.cuerpo)
    .join(';');

describe('contraste', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas');
    assert.ok(site.ok, site.output);
  });

  for (const ruta of ['/obras/', '/obras/sin-titulo-01/']) {
    describe(`en ${ruta}`, () => {
      let reglas;
      let colores;
      before(() => {
        reglas = reglasCss(site, site.page(ruta));
        colores = tokens(reglas);
      });

      test('todo color de texto cumple WCAG AA (4.5:1) sobre el fondo hueso', () => {
        assert.equal(colores['--color-fondo'], '#faf8f4');
        for (const nombre of ['--color-texto', '--color-acento', '--color-secundario', '--color-tenue']) {
          assert.ok(colores[nombre], `falta el token ${nombre}`);
          const ratio = contraste(colores[nombre], colores['--color-fondo']);
          assert.ok(ratio >= 4.5, `${nombre} ${colores[nombre]} tiene contraste ${ratio.toFixed(2)}:1`);
        }
      });

      test('Disponible usa el acento; Reservada y Vendida un color más tenue que el secundario, sin opacidad', () => {
        assert.match(declaraciones(reglas, '.estado-disponible'), /color:\s*var\(--color-acento\)/);
        for (const estado of ['reservada', 'vendida']) {
          const cuerpo = declaraciones(reglas, `.estado-${estado}`);
          assert.match(cuerpo, /color:\s*var\(--color-tenue\)/);
          assert.doesNotMatch(cuerpo, /opacity/);
        }
        assert.doesNotMatch(declaraciones(reglas, '.estado'), /opacity/);
        const fondo = colores['--color-fondo'];
        assert.ok(
          contraste(colores['--color-tenue'], fondo) < contraste(colores['--color-secundario'], fondo),
          'el tenue debería contrastar menos que el secundario',
        );
      });
    });
  }
});

/** Las <img> de <main>, en orden. */
const imagenes = (page) => page.querySelectorAll('main img');

function verificarCarga(page, ruta) {
  const [primera, ...resto] = imagenes(page);
  assert.ok(primera, `${ruta} no tiene imágenes`);
  assert.notEqual(primera.getAttribute('loading'), 'lazy', `${ruta}: la primera imagen es lazy`);
  assert.equal(primera.getAttribute('fetchpriority'), 'high', `${ruta}: la primera imagen no tiene fetchpriority=high`);
  for (const img of resto) {
    assert.equal(img.getAttribute('loading'), 'lazy', `${ruta}: ${img.getAttribute('alt')} no es lazy`);
    assert.ok(!img.hasAttribute('fetchpriority'), `${ruta}: ${img.getAttribute('alt')} tiene fetchpriority`);
  }
}

describe('carga de imágenes: solo la primera de cada página es inmediata', () => {
  let series;
  let inicio;
  before(async () => {
    // De a uno: dos builds en paralelo comparten .astro/ y se pisan.
    series = await buildSite('series');
    inicio = await buildSite('inicio');
    assert.ok(series.ok, series.output);
    assert.ok(inicio.ok, inicio.output);
  });

  for (const ruta of [
    '/obras/',
    '/obras/tecnica/oleo/',
    '/obras/serie/marinas/',
    '/series/marinas/',
    '/obras/faro/',
  ]) {
    test(ruta, () => verificarCarga(series.page(ruta), ruta));
  }

  test('/ (Destacadas)', () => verificarCarga(inicio.page('/'), '/'));
});
