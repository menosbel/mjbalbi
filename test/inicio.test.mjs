import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

describe('inicio /', () => {
  let main;
  before(async () => {
    const site = await buildSite('inicio', { base: '/mjbalbi' });
    assert.ok(site.ok, site.output);
    main = site.page('/').querySelector('main');
  });

  test('muestra solo las Destacadas, en el orden de la galería, cada una con link a su página', () => {
    const destacadas = main.querySelectorAll('.destacadas li').map((li) => ({
      titulo: li.querySelector('h2, h3')?.text.trim(),
      href: li.querySelector('a')?.getAttribute('href'),
    }));
    assert.deepEqual(destacadas, [
      { titulo: 'Cerros', href: '/mjbalbi/obras/cerros/' },
      { titulo: 'Bruma', href: '/mjbalbi/obras/bruma/' },
      { titulo: 'Puerto', href: '/mjbalbi/obras/puerto/' },
    ]);
  });

  test('tiene un link a la galería', () => {
    const hrefs = main.querySelectorAll('a').map((a) => a.getAttribute('href'));
    assert.ok(hrefs.includes('/mjbalbi/obras/'), hrefs.join('\n'));
  });

  test('muestra la presentación de la artista cargada en sobre-mi/presentacion.md', () => {
    const parrafos = main.querySelectorAll('.presentacion p').map((p) => p.text.trim());
    assert.deepEqual(parrafos, ['Pinta paisajes del litoral con óleo y pastel.']);
  });
});

describe('inicio / sin Destacadas', () => {
  let main;
  before(async () => {
    const site = await buildSite('obras-validas');
    assert.ok(site.ok, site.output);
    main = site.page('/').querySelector('main');
  });

  test('se genera sin una sección de Destacadas vacía, y con el link a la galería', () => {
    assert.equal(main.querySelector('.destacadas'), null);
    assert.ok(main.querySelectorAll('a').some((a) => a.getAttribute('href') === '/obras/'));
  });
});
