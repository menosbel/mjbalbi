import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

/** Every local URL a page points to: links, stylesheets, scripts and images. */
function urlsLocales(page) {
  const urls = [];
  for (const el of page.querySelectorAll('[href], [src], [srcset]')) {
    for (const attr of ['href', 'src']) {
      const value = el.getAttribute(attr);
      if (value !== undefined) urls.push(value);
    }
    const srcset = el.getAttribute('srcset');
    if (srcset) urls.push(...srcset.split(',').map((c) => c.trim().split(/\s+/)[0]));
  }
  return urls.filter((url) => !/^([a-z]+:|#)/i.test(url));
}

for (const base of ['/mjbalbi', '']) {
  describe(`con base path "${base}"`, () => {
    let site;
    before(async () => {
      site = await buildSite('obras-validas', { base });
      assert.ok(site.ok, site.output);
    });

    test('genera el inicio, la galería con sus vistas filtradas, una página por Obra y Sobre mí', () => {
      assert.deepEqual(site.pages(), [
        '/',
        '/obras/',
        '/obras/atardecer-en-el-rio/',
        '/obras/sin-titulo-01/',
        '/obras/tecnica/oleo/',
        '/obras/tecnica/pastel/',
        '/sobre-mi/',
      ]);
    });

    test('el inicio enlaza a la galería', () => {
      const hrefs = site.page('/').querySelectorAll('main a').map((a) => a.getAttribute('href'));
      assert.ok(hrefs.includes(`${base}/obras/`), hrefs.join('\n'));
    });

    test('todos los links internos e imágenes apuntan a archivos del build, bajo el base path', () => {
      for (const path of site.pages()) {
        const urls = urlsLocales(site.page(path));
        assert.ok(urls.length > 0, `${path} no tiene links ni imágenes`);
        for (const url of urls) {
          assert.ok(site.resolveUrl(url), `${path}: ${url} no existe en el build o no empieza con "${base}/"`);
        }
      }
    });
  });
}
