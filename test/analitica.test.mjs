import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

const scriptsGoatCounter = (page) => page.querySelectorAll('script[data-goatcounter]');

describe('GoatCounter', () => {
  test('sin código configurado, ninguna página incluye el script', async () => {
    const site = await buildSite('obras-validas');
    assert.ok(site.ok, site.output);
    for (const path of site.pages()) {
      assert.equal(scriptsGoatCounter(site.page(path)).length, 0, path);
      assert.doesNotMatch(site.page(path).toString(), /goatcounter|gc\.zgo\.at/i, path);
    }
  });

  test('con un código, todas las páginas cuentan las visitas en esa cuenta', async () => {
    const site = await buildSite('obras-validas', { env: { GOATCOUNTER: 'mjbalbi' } });
    assert.ok(site.ok, site.output);
    for (const path of site.pages()) {
      const [script] = scriptsGoatCounter(site.page(path));
      assert.ok(script, `${path} no incluye GoatCounter`);
      assert.equal(script.getAttribute('data-goatcounter'), 'https://mjbalbi.goatcounter.com/count');
      assert.equal(script.getAttribute('src'), 'https://gc.zgo.at/count.js');
      assert.ok(script.hasAttribute('async'));
    }
  });
});
