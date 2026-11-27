import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

const SITE_URL = 'https://ejemplo.test';

const meta = (page, selector) => page.querySelector(selector)?.getAttribute('content');

describe('SEO de todas las páginas', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas', { base: '/mjbalbi', env: { SITE_URL } });
    assert.ok(site.ok, site.output);
  });

  test('cada página tiene title, meta description y canonical, únicos', () => {
    const titles = new Set();
    const descriptions = new Set();
    const canonicals = new Set();
    for (const path of site.pages()) {
      const page = site.page(path);
      const title = page.querySelector('title')?.text.trim();
      const description = meta(page, 'meta[name="description"]');
      const canonical = page.querySelector('link[rel="canonical"]')?.getAttribute('href');
      assert.ok(title, `${path} no tiene <title>`);
      assert.ok(description, `${path} no tiene meta description`);
      assert.equal(canonical, `${SITE_URL}/mjbalbi${path}`, `${path}: canonical`);
      titles.add(title);
      descriptions.add(description);
      canonicals.add(canonical);
    }
    const n = site.pages().length;
    assert.equal(titles.size, n, 'hay títulos repetidos');
    assert.equal(descriptions.size, n, 'hay descriptions repetidas');
    assert.equal(canonicals.size, n, 'hay canonicals repetidos');
  });

  test('cada página tiene Open Graph y Twitter Card', () => {
    for (const path of site.pages()) {
      const page = site.page(path);
      assert.equal(meta(page, 'meta[property="og:title"]'), page.querySelector('title').text.trim(), `${path}: og:title`);
      assert.equal(meta(page, 'meta[property="og:description"]'), meta(page, 'meta[name="description"]'), `${path}: og:description`);
      assert.equal(meta(page, 'meta[property="og:url"]'), `${SITE_URL}/mjbalbi${path}`, `${path}: og:url`);
      assert.ok(meta(page, 'meta[property="og:type"]'), `${path}: og:type`);
      assert.equal(meta(page, 'meta[property="og:locale"]'), 'es_AR', `${path}: og:locale`);
      assert.match(meta(page, 'meta[name="twitter:card"]') ?? '', /^summary(_large_image)?$/, `${path}: twitter:card`);
    }
  });

  test('en una Obra, la imagen de Open Graph y Twitter es la foto principal', () => {
    const page = site.page('/obras/atardecer-en-el-rio/');
    const image = meta(page, 'meta[property="og:image"]');
    assert.ok(image?.startsWith(`${SITE_URL}/mjbalbi/`), `og:image no es absoluta: ${image}`);
    assert.match(image, /frente/, 'og:image no es la primera foto');
    assert.ok(site.resolveUrl(image.slice(SITE_URL.length)), `${image} no existe en el build`);
    assert.equal(meta(page, 'meta[property="og:image:alt"]'), 'Un río ancho bajo un cielo naranja, con la orilla en sombra');
    assert.equal(meta(page, 'meta[name="twitter:card"]'), 'summary_large_image');
    assert.equal(meta(page, 'meta[name="twitter:image"]'), image);
  });

  const jsonLd = (page) =>
    page.querySelectorAll('script[type="application/ld+json"]').map((s) => JSON.parse(s.text));

  test('cada Obra tiene un JSON-LD VisualArtwork con sus datos', () => {
    const page = site.page('/obras/atardecer-en-el-rio/');
    const [obra] = jsonLd(page).filter((d) => d['@type'] === 'VisualArtwork');
    assert.ok(obra, 'no hay VisualArtwork');
    const cm = (value) => ({ '@type': 'QuantitativeValue', value, unitCode: 'CMT', unitText: 'cm' });
    assert.deepEqual(obra, {
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      name: 'Atardecer en el río',
      url: `${SITE_URL}/mjbalbi/obras/atardecer-en-el-rio/`,
      image: meta(page, 'meta[property="og:image"]'),
      creator: { '@type': 'Person', name: 'María Julia Balbi' },
      artform: 'Pintura',
      artMedium: 'Óleo',
      artworkSurface: 'Lienzo',
      height: cm(60),
      width: cm(80),
      depth: cm(3),
      dateCreated: '2024',
      description: 'El río Paraná a la hora en que el agua se vuelve cobre.',
    });
  });

  test('el JSON-LD omite lo que la Obra no tiene', () => {
    const [obra] = jsonLd(site.page('/obras/sin-titulo-01/')).filter((d) => d['@type'] === 'VisualArtwork');
    assert.equal(obra.artMedium, 'Pastel');
    assert.equal(obra.dateCreated, '2019');
    for (const campo of ['artworkSurface', 'depth', 'description']) {
      assert.ok(!(campo in obra), `no debería tener ${campo}`);
    }
  });

  test('las páginas que no son de Obra no tienen VisualArtwork', () => {
    assert.equal(jsonLd(site.page('/')).filter((d) => d['@type'] === 'VisualArtwork').length, 0);
  });
});

test('sin base path, las URLs absolutas cuelgan de la raíz del dominio', async () => {
  const site = await buildSite('obras-validas', { base: '', env: { SITE_URL } });
  assert.ok(site.ok, site.output);
  const page = site.page('/obras/atardecer-en-el-rio/');
  assert.equal(page.querySelector('link[rel="canonical"]').getAttribute('href'), `${SITE_URL}/obras/atardecer-en-el-rio/`);
  assert.ok(meta(page, 'meta[property="og:image"]').startsWith(`${SITE_URL}/_astro/`));
});
