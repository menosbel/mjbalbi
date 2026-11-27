import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

describe('layout base', () => {
  let site;
  let page;
  let css;
  before(async () => {
    site = await buildSite('obras-validas', { base: '/mjbalbi' });
    assert.ok(site.ok, site.output);
    page = site.page('/obras/atardecer-en-el-rio/');
    // Inline <style> blocks plus every linked stylesheet.
    const linked = page
      .querySelectorAll('link[rel="stylesheet"]')
      .map((l) => readFileSync(site.resolveUrl(l.getAttribute('href')), 'utf8'));
    css = [...page.querySelectorAll('style').map((s) => s.text), ...linked].join('\n').toLowerCase();
  });

  test('está en español y es mobile first', () => {
    assert.equal(page.querySelector('html').getAttribute('lang'), 'es');
    assert.match(page.querySelector('meta[name="viewport"]').getAttribute('content'), /width=device-width/);
  });

  test('el encabezado lleva el nombre de la artista y enlaza al inicio', () => {
    const link = page.querySelector('header a');
    assert.equal(link.text.trim(), 'María Julia Balbi');
    assert.equal(link.getAttribute('href'), '/mjbalbi/');
  });

  test('usa la paleta acordada', () => {
    // El oliva secundario de #4 (#6b7a5e) se oscureció a #5a6a4f para cumplir WCAG AA.
    for (const color of ['#faf8f4', '#1f1d1a', '#a4532f', '#5a6a4f']) {
      assert.ok(css.includes(color), `falta el color ${color}`);
    }
  });

  test('títulos en serif y texto en sans', () => {
    assert.match(css, /--fuente-titulos:[^;]*serif/);
    assert.match(css, /--fuente-texto:[^;]*sans-serif/);
  });

  test('solo modo claro', () => {
    assert.match(page.querySelector('meta[name="color-scheme"]')?.getAttribute('content') ?? '', /^light$/);
    assert.doesNotMatch(css, /prefers-color-scheme:\s*dark/);
  });
});
