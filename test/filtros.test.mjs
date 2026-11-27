import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite, reglasCss } from './harness.mjs';

/** Filter links of the gallery: [{ texto, href }]. */
const filtros = (page) =>
  page.querySelectorAll('main .filtros a').map((a) => ({ texto: a.text.trim(), href: a.getAttribute('href') }));

/** Obras shown in the gallery grid, as hrefs in page order. */
const obras = (page) => page.querySelectorAll('main .galeria > li a').map((a) => a.getAttribute('href'));

describe('filtros de la galería por Técnica y Serie', () => {
  let site;
  before(async () => {
    site = await buildSite('series', { base: '/mjbalbi' });
    assert.ok(site.ok, site.output);
  });

  test('la galería ofrece un filtro por cada Técnica y por cada Serie del contenido, y uno para ver todas', () => {
    assert.deepEqual(filtros(site.page('/obras/')), [
      { texto: 'Todas', href: '/mjbalbi/obras/' },
      { texto: 'Óleo', href: '/mjbalbi/obras/tecnica/oleo/' },
      { texto: 'Acrílico', href: '/mjbalbi/obras/tecnica/acrilico/' },
      { texto: 'Pastel', href: '/mjbalbi/obras/tecnica/pastel/' },
      { texto: 'Marinas', href: '/mjbalbi/obras/serie/marinas/' },
      { texto: 'Retratos', href: '/mjbalbi/obras/serie/retratos/' },
    ]);
  });

  test('sin JS, la galería completa trae todas las Obras', () => {
    assert.deepEqual(obras(site.page('/obras/')).sort(), [
      '/mjbalbi/obras/faro/',
      '/mjbalbi/obras/muelle/',
      '/mjbalbi/obras/ola/',
      '/mjbalbi/obras/puerto/',
      '/mjbalbi/obras/rostro/',
      '/mjbalbi/obras/suelta/',
    ]);
  });

  test('al filtrar por una Técnica quedan solo sus Obras, en el orden de la galería', () => {
    assert.deepEqual(obras(site.page('/obras/tecnica/oleo/')), [
      '/mjbalbi/obras/rostro/', // disponible, 2021
      '/mjbalbi/obras/ola/', // disponible, 2020
      '/mjbalbi/obras/muelle/', // disponible, 2018
    ]);
    assert.deepEqual(obras(site.page('/obras/tecnica/pastel/')), ['/mjbalbi/obras/faro/']);
  });

  test('al filtrar por una Serie quedan solo sus Obras, en el orden de la galería', () => {
    assert.deepEqual(obras(site.page('/obras/serie/marinas/')), [
      '/mjbalbi/obras/faro/', // reservada, 2022
      '/mjbalbi/obras/ola/', // disponible, 2020
      '/mjbalbi/obras/muelle/', // disponible, 2018
      '/mjbalbi/obras/puerto/', // vendida, 2024
    ]);
    assert.deepEqual(obras(site.page('/obras/serie/retratos/')), ['/mjbalbi/obras/rostro/']);
  });

  test('los filtros se usan con el teclado: son links enfocables y el elegido se anuncia', () => {
    for (const path of ['/obras/', '/obras/tecnica/oleo/', '/obras/serie/marinas/']) {
      const links = site.page(path).querySelectorAll('main nav.filtros a');
      assert.ok(links.length > 0, `${path} no tiene filtros`);
      for (const a of links) {
        assert.ok(a.getAttribute('href'), `${path}: filtro sin href`);
        assert.ok(!(Number(a.getAttribute('tabindex')) < 0), `${path}: filtro fuera del orden de tabulación`);
      }
      const actuales = links.filter((a) => a.getAttribute('aria-current') === 'page').map((a) => a.getAttribute('href'));
      assert.deepEqual(actuales, [`/mjbalbi${path}`]);
    }
  });

  test('los filtros usan el color secundario', () => {
    const cuerpos = reglasCss(site, site.page('/obras/'))
      .filter((r) => r.selector.split(',').some((s) => /\.filtros\b.*\ba\b/.test(s)))
      .map((r) => r.cuerpo)
      .join(';');
    assert.match(cuerpos, /var\(--color-secundario\)/);
  });
});
