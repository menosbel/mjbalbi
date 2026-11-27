import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

/** The Consulta link inside the Obra's ficha, with its mailto: parsed. */
function consulta(page) {
  const link = page.querySelector('main a.consulta');
  assert.ok(link, 'la página no tiene un botón de Consulta (a.consulta)');
  const href = link.getAttribute('href');
  assert.match(href, /^mailto:/);
  const parsed = new URL(href);
  return {
    texto: link.text.trim(),
    para: decodeURIComponent(parsed.pathname),
    asunto: parsed.searchParams.get('subject'),
    href,
  };
}

describe('Consulta por email', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas');
    assert.ok(site.ok, site.output);
  });

  test('una Obra Disponible invita a consultar por esa obra, con el título en el asunto', () => {
    const c = consulta(site.page('/obras/atardecer-en-el-rio/'));
    assert.equal(c.texto, 'Consultar por esta obra');
    assert.equal(c.para, 'contacto@example.com');
    assert.match(c.asunto, /Atardecer en el río/);
  });

  test('una Obra Vendida invita a consultar por obras similares, referenciando la Obra', () => {
    const c = consulta(site.page('/obras/sin-titulo-01/'));
    assert.equal(c.texto, 'Consultar por obras similares');
    assert.equal(c.para, 'contacto@example.com');
    assert.match(c.asunto, /similares/i);
    assert.match(c.asunto, /Sin título/);
  });

  test('el botón de Consulta usa el color de acento', () => {
    const page = site.page('/obras/atardecer-en-el-rio/');
    const linked = page
      .querySelectorAll('link[rel="stylesheet"]')
      .map((l) => readFileSync(site.resolveUrl(l.getAttribute('href')), 'utf8'));
    const css = [...page.querySelectorAll('style').map((s) => s.text), ...linked].join('\n');
    assert.match(css, /\.consulta[^{]*\{[^}]*background(-color)?:\s*var\(--color-acento\)/);
  });

  describe('con un título con tildes, espacios y símbolos', () => {
    let reservada;
    before(async () => {
      reservada = await buildSite('consultas');
      assert.ok(reservada.ok, reservada.output);
    });

    test('una Obra Reservada invita a consultar por esa obra', () => {
      const c = consulta(reservada.page('/obras/manana-y-niebla/'));
      assert.equal(c.texto, 'Consultar por esta obra');
    });

    test('el asunto llega entero y bien codificado', () => {
      const c = consulta(reservada.page('/obras/manana-y-niebla/'));
      assert.match(c.asunto, /Mañana & niebla: ¿50% gris\? #2/);
      // Solo un parámetro: ni & ni # del título cortan el mailto:.
      const query = c.href.slice(c.href.indexOf('?') + 1);
      assert.doesNotMatch(query, /[ &#]/);
    });
  });
});
