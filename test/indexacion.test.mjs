import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

const SITE_URL = 'https://ejemplo.test';
const robotsMeta = (page) => page.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';

describe('indexación por defecto (desactivada)', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas', { base: '/mjbalbi', env: { SITE_URL } });
    assert.ok(site.ok, site.output);
  });

  test('todas las páginas llevan noindex', () => {
    for (const path of site.pages()) {
      assert.match(robotsMeta(site.page(path)), /noindex/, `${path} no tiene noindex`);
    }
  });

  test('robots.txt prohíbe rastrear todo el sitio', () => {
    const robots = readFileSync(site.fileFor('/robots.txt'), 'utf8');
    assert.match(robots, /^User-agent: \*$/m);
    assert.match(robots, /^Disallow: \/$/m);
  });
});

describe('indexación activada', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas', { base: '/mjbalbi', env: { SITE_URL, SITE_INDEXAR: 'true' } });
    assert.ok(site.ok, site.output);
  });

  test('ninguna página lleva noindex', () => {
    for (const path of site.pages()) {
      assert.doesNotMatch(robotsMeta(site.page(path)), /noindex/, `${path} tiene noindex`);
    }
  });

  test('robots.txt permite rastrear y apunta al sitemap', () => {
    const robots = readFileSync(site.fileFor('/robots.txt'), 'utf8');
    assert.match(robots, /^User-agent: \*$/m);
    assert.doesNotMatch(robots, /^Disallow: \/$/m);
    assert.match(robots, new RegExp(`^Sitemap: ${SITE_URL}/mjbalbi/sitemap-index\\.xml$`, 'm'));
  });
});

describe('sitemap', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas', { base: '/mjbalbi', env: { SITE_URL } });
    assert.ok(site.ok, site.output);
  });

  test('el build genera un sitemap con todas las páginas', () => {
    const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const indice = readFileSync(site.fileFor('/sitemap-index.xml'), 'utf8');
    const urls = locs(indice).flatMap((sitemap) => {
      assert.ok(sitemap.startsWith(`${SITE_URL}/mjbalbi/`), `${sitemap} no es absoluta`);
      return locs(readFileSync(site.fileFor(sitemap.slice(`${SITE_URL}/mjbalbi`.length)), 'utf8'));
    });
    assert.deepEqual(urls.sort(), site.pages().map((p) => `${SITE_URL}/mjbalbi${p}`).sort());
  });
});
