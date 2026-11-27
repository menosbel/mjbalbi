import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

describe('página de una Obra', () => {
  let site;
  let page;
  before(async () => {
    site = await buildSite('obras-validas');
    assert.ok(site.ok, site.output);
    page = site.page('/obras/atardecer-en-el-rio/');
  });

  test('se genera en /obras/<slug>/ con el título como h1', () => {
    assert.equal(page.querySelector('h1')?.text.trim(), 'Atardecer en el río');
  });
});
