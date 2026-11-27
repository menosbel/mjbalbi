import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

describe('página Sobre mí', () => {
  let site;
  let main;
  before(async () => {
    site = await buildSite('sobre-mi');
    assert.ok(site.ok, site.output);
    main = site.page('/sobre-mi/').querySelector('main');
  });

  test('muestra la biografía cargada en Markdown', () => {
    const parrafos = main.querySelectorAll('p').map((p) => p.text.trim());
    assert.ok(parrafos.includes('Nació en Rosario y pinta desde chica.'), parrafos.join('\n'));
    assert.ok(parrafos.includes('Vive y trabaja en Buenos Aires.'));
  });

  test('muestra el Statement en su propia sección', () => {
    const seccion = seccionTitulada(main, 'Statement');
    assert.equal(seccion.querySelector('p').text.trim(), 'Pinto lo que queda de un paisaje cuando ya me fui.');
  });

  test('la Trayectoria distingue formación, exposiciones y premios', () => {
    const seccion = seccionTitulada(main, 'Trayectoria');
    const items = (titulo) => {
      const h3 = seccion.querySelectorAll('h3').find((h) => h.text.trim() === titulo);
      assert.ok(h3, `la Trayectoria no tiene "${titulo}"`);
      return h3.nextElementSibling.querySelectorAll('li').map((li) => li.text.trim().replace(/\s+/g, ' '));
    };
    assert.deepEqual(items('Formación'), [
      '2008–2012 Profesorado de Artes Visuales, Escuela de Bellas Artes',
      '2014 Taller de pintura con Ana Pérez',
    ]);
    assert.deepEqual(items('Exposiciones'), ['2019 Muestra individual "Orillas", Galería del Puerto']);
    assert.deepEqual(items('Premios'), ['2021 Primer premio, Salón de Pintura de Rosario']);
  });

  test('tiene un solo h1 y los encabezados no saltean niveles', () => {
    const niveles = site
      .page('/sobre-mi/')
      .querySelectorAll('h1, h2, h3, h4, h5, h6')
      .map((h) => Number(h.tagName[1]));
    assert.equal(niveles.filter((n) => n === 1).length, 1);
    assert.equal(niveles[0], 1);
    niveles.forEach((n, i) => i > 0 && assert.ok(n <= niveles[i - 1] + 1, `salta de h${niveles[i - 1]} a h${n}`));
  });
});

describe('JSON-LD Person', () => {
  let site;
  before(async () => {
    site = await buildSite('sobre-mi', { base: '/mjbalbi' });
    assert.ok(site.ok, site.output);
  });

  for (const path of ['/sobre-mi/', '/']) {
    test(`${path} describe a la artista con su Instagram`, () => {
      const scripts = site.page(path).querySelectorAll('script[type="application/ld+json"]');
      const personas = scripts.map((s) => JSON.parse(s.text)).filter((d) => d['@type'] === 'Person');
      assert.equal(personas.length, 1, 'debe haber exactamente un JSON-LD Person');
      assert.deepEqual(personas[0], {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'María Julia Balbi',
        url: 'https://menosbel.github.io/mjbalbi/',
        sameAs: ['https://www.instagram.com/mjbalbi.arte/'],
      });
    });
  }
});

/** The <section> whose h2 reads `titulo`. */
function seccionTitulada(main, titulo) {
  const h2 = main.querySelectorAll('section > h2').find((h) => h.text.trim() === titulo);
  assert.ok(h2, `no hay una sección "${titulo}"`);
  return h2.parentNode;
}
