import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

describe('pie de página', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas', { base: '/mjbalbi' });
    assert.ok(site.ok, site.output);
  });

  test('todas las páginas muestran el email y el link a Instagram de la configuración', () => {
    const paginas = site.pages();
    assert.ok(paginas.length >= 3);
    for (const path of paginas) {
      const footer = site.page(path).querySelector('footer');
      assert.ok(footer, `${path} no tiene pie`);
      const hrefs = footer.querySelectorAll('a').map((a) => a.getAttribute('href'));
      assert.ok(hrefs.includes('mailto:contacto@example.com'), `${path}: falta el email en ${hrefs}`);
      assert.match(footer.text, /contacto@example\.com/);
      assert.ok(hrefs.includes('https://www.instagram.com/mjbalbi.arte/'), `${path}: falta Instagram en ${hrefs}`);
    }
  });
});
