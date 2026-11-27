import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

describe('navegación del encabezado', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas', { base: '/mjbalbi' });
    assert.ok(site.ok, site.output);
  });

  test('cada página enlaza al inicio (con el nombre de la artista), a Obras y a Sobre mí', () => {
    for (const path of site.pages()) {
      const links = site
        .page(path)
        .querySelectorAll('header a')
        .map((a) => [a.text.trim(), a.getAttribute('href')]);
      assert.deepEqual(
        links,
        [
          ['María Julia Balbi', '/mjbalbi/'],
          ['Obras', '/mjbalbi/obras/'],
          ['Sobre mí', '/mjbalbi/sobre-mi/'],
        ],
        path,
      );
    }
  });

  test('marca la sección actual con aria-current', () => {
    const actual = (path) => site.page(path).querySelector('header [aria-current="page"]')?.text.trim();
    assert.equal(actual('/obras/'), 'Obras');
    assert.equal(actual('/sobre-mi/'), 'Sobre mí');
    assert.equal(actual('/'), undefined);
  });
});
