import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

/** Obra pages linked from <main>, in document order, without repeats. */
function obrasEnlazadas(page) {
  const hrefs = page.querySelectorAll('main a').map((a) => a.getAttribute('href'));
  return [...new Set(hrefs.filter((h) => h.startsWith('/obras/')))];
}

describe('página de una Serie', () => {
  let site;
  before(async () => {
    site = await buildSite('series');
    assert.ok(site.ok, site.output);
  });

  test('se genera en /series/<slug>/ con el nombre como h1 y el texto de la artista', () => {
    const page = site.page('/series/marinas/');
    assert.equal(page.querySelector('h1')?.text.trim(), 'Marinas');
    assert.match(page.querySelector('main').text, /Pinturas del mar y de la costa, hechas durante varios veranos\./);
  });

  test('muestra solo sus Obras', () => {
    assert.deepEqual(obrasEnlazadas(site.page('/series/retratos/')), ['/obras/rostro/']);
  });

  test('muestra sus Obras en el orden de la galería: Disponibles y Reservadas de la más nueva a la más vieja, Vendidas al final', () => {
    assert.deepEqual(obrasEnlazadas(site.page('/series/marinas/')), [
      '/obras/faro/', // reservada, 2022
      '/obras/ola/', // disponible, 2020
      '/obras/muelle/', // disponible, 2018
      '/obras/puerto/', // vendida, 2024
    ]);
  });
});

describe('link desde la Obra a su Serie', () => {
  let site;
  before(async () => {
    site = await buildSite('series');
    assert.ok(site.ok, site.output);
  });

  const linksASeries = (page) =>
    page.querySelectorAll('main a').filter((a) => a.getAttribute('href').startsWith('/series/'));

  test('una Obra con Serie enlaza a la página de la Serie, con su nombre', () => {
    const links = linksASeries(site.page('/obras/faro/'));
    assert.equal(links.length, 1);
    assert.equal(links[0].getAttribute('href'), '/series/marinas/');
    assert.match(links[0].text, /Marinas/);
  });

  test('una Obra sin Serie no tiene link a una Serie', () => {
    assert.deepEqual(linksASeries(site.page('/obras/suelta/')), []);
  });
});

describe('Series con base path "/mjbalbi"', () => {
  let site;
  before(async () => {
    site = await buildSite('series', { base: '/mjbalbi' });
    assert.ok(site.ok, site.output);
  });

  test('los links e imágenes de la Serie y el link de la Obra a su Serie apuntan al build, bajo el base path', () => {
    const serie = site.page('/series/marinas/');
    const urls = [
      ...serie.querySelectorAll('main a').map((a) => a.getAttribute('href')),
      ...serie.querySelectorAll('main img').map((img) => img.getAttribute('src')),
      ...site.page('/obras/faro/').querySelectorAll('.serie a').map((a) => a.getAttribute('href')),
    ];
    assert.ok(urls.includes('/mjbalbi/series/marinas/'));
    for (const url of urls) assert.ok(site.resolveUrl(url), `${url} no existe en el build o no empieza con "/mjbalbi/"`);
  });
});
