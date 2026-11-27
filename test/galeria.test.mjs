import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildSite } from './harness.mjs';

/** The gallery's items (one per Obra), in page order. */
const items = (page) => page.querySelectorAll('main .galeria > li');

describe('galería /obras/', () => {
  let site;
  let page;
  before(async () => {
    site = await buildSite('obras-validas', { base: '/mjbalbi' });
    assert.ok(site.ok, site.output);
    page = site.page('/obras/');
  });

  test('lista todas las Obras, cada una con un link a su página', () => {
    const hrefs = items(page).map((li) => li.querySelector('a')?.getAttribute('href'));
    assert.deepEqual(hrefs.sort(), ['/mjbalbi/obras/atardecer-en-el-rio/', '/mjbalbi/obras/sin-titulo-01/']);
  });

  test('cada Obra muestra su foto principal con texto alternativo, su título y su Estado', () => {
    const vistas = items(page).map((li) => ({
      alt: li.querySelector('img')?.getAttribute('alt'),
      titulo: li.querySelector('h2')?.text.trim(),
      estado: li.querySelector('.estado')?.text.trim(),
    }));
    assert.deepEqual(vistas, [
      {
        alt: 'Un río ancho bajo un cielo naranja, con la orilla en sombra',
        titulo: 'Atardecer en el río',
        estado: 'Disponible',
      },
      { alt: 'Manchas oscuras superpuestas sobre fondo negro', titulo: 'Sin título', estado: 'Vendida' },
    ]);
  });

  test('las fotos vienen en varios tamaños y existen en el build', () => {
    for (const img of items(page).map((li) => li.querySelector('img'))) {
      const srcset = img.getAttribute('srcset') ?? '';
      assert.ok(srcset.includes(','), `srcset con un solo tamaño: ${srcset}`);
      assert.ok(site.resolveUrl(img.getAttribute('src')), `no existe ${img.getAttribute('src')}`);
    }
  });

  test('la etiqueta Disponible usa el acento; Reservada y Vendida, el secundario más tenue', () => {
    const reglas = reglasCss(site, page);
    const declaraciones = (estado) =>
      reglas
        .filter((r) => r.media === null && r.selector.split(',').some((s) => s.includes(`.estado-${estado}`)))
        .map((r) => r.cuerpo)
        .join(';');
    assert.match(declaraciones('disponible'), /color:\s*var\(--color-acento\)/);
    assert.doesNotMatch(declaraciones('disponible'), /opacity/);
    for (const estado of ['reservada', 'vendida']) {
      assert.match(declaraciones(estado), /color:\s*var\(--color-secundario\)/);
      assert.match(declaraciones(estado), /opacity:\s*0?\.\d/);
    }
  });

  test('en el celular la grilla es de una columna y crece en pantallas más anchas', () => {
    const galeria = reglasCss(site, page).filter((r) => /\.galeria\b/.test(r.selector) && /grid-template-columns/.test(r.cuerpo));
    const base = galeria.find((r) => r.media === null);
    assert.match(base?.cuerpo ?? '', /grid-template-columns:\s*1fr/);
    // Astro minifies `(min-width: 36rem)` to `(width>=36rem)`.
    assert.ok(galeria.some((r) => /min-width|width\s*>=/.test(r.media ?? '')), 'la grilla no cambia en pantallas anchas');
    for (const img of items(page).map((li) => li.querySelector('img'))) {
      assert.match(img.getAttribute('sizes') ?? '', /100vw$/);
    }
  });
});

/**
 * CSS rules that apply to the page (inline <style> plus linked stylesheets),
 * as { selector, cuerpo, media } with media = the @media condition or null.
 */
function reglasCss(site, page) {
  const linked = page
    .querySelectorAll('link[rel="stylesheet"]')
    .map((l) => readFileSync(site.resolveUrl(l.getAttribute('href')), 'utf8'));
  const css = [...page.querySelectorAll('style').map((s) => s.text), ...linked].join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const reglas = [];
  const re = /@media([^{]*)\{((?:[^{}]*\{[^{}]*\})*)\s*\}|([^{}@]+)\{([^{}]*)\}/g;
  for (const m of css.matchAll(re)) {
    if (m[1] !== undefined) {
      for (const [, selector, cuerpo] of m[2].matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        reglas.push({ selector: selector.trim(), cuerpo, media: m[1].trim() });
      }
    } else {
      reglas.push({ selector: m[3].trim(), cuerpo: m[4], media: null });
    }
  }
  return reglas;
}

describe('orden de la galería', () => {
  test('primero Disponibles y Reservadas juntas, de la más reciente a la más vieja; Vendidas al final', async () => {
    const site = await buildSite('galeria-orden');
    assert.ok(site.ok, site.output);
    const orden = items(site.page('/obras/')).map(
      (li) => `${li.querySelector('h2').text.trim()} (${li.querySelector('.estado').text.trim()})`,
    );
    assert.deepEqual(orden, [
      'Delta (Disponible)', // 2024
      'Cerros (Reservada)', // 2023
      'Faro (Reservada)', // 2021
      'Bruma (Disponible)', // 2020
      'Alba (Vendida)', // 2025
      'Garza (Vendida)', // 2022
      'Estero (Vendida)', // 2018
    ]);
  });

  test('si el año empata, va primero la cargada más recientemente (la que se agregó después a git)', async () => {
    // Content in its own git repo: "cerros" committed first, then "alba", and
    // "bruma" not committed yet. Same year and Estado, so only the load order decides.
    const dir = mkdtempSync(join(tmpdir(), 'mjbalbi-carga-'));
    const obras = join(dir, 'obras');
    mkdirSync(obras);
    copyFileSync(join(fixtures, 'galeria-orden/obras/foto.jpg'), join(obras, 'foto.jpg'));
    const git = (args, fecha) =>
      execFileSync('git', args, {
        cwd: dir,
        env: { ...process.env, GIT_AUTHOR_DATE: fecha, GIT_COMMITTER_DATE: fecha },
      });
    git(['init', '-q']);
    git(['config', 'user.email', 'test@example.com']);
    git(['config', 'user.name', 'Test']);
    for (const [slug, fecha] of [
      ['cerros', '2026-01-01T10:00:00Z'],
      ['alba', '2026-03-01T10:00:00Z'],
      ['bruma', null],
    ]) {
      writeFileSync(join(obras, `${slug}.md`), obra(slug));
      if (fecha) {
        git(['add', '.'], fecha);
        git(['commit', '-q', '-m', slug], fecha);
      }
    }

    const site = await buildSite(dir);
    assert.ok(site.ok, site.output);
    const orden = items(site.page('/obras/')).map((li) => li.querySelector('h2').text.trim());
    assert.deepEqual(orden, ['bruma', 'alba', 'cerros']);
  });
});

const fixtures = fileURLToPath(new URL('./fixtures/', import.meta.url));

/** An available Obra from 2024 whose title is its slug. */
const obra = (slug) => `---
titulo: ${slug}
fotos:
  - src: ./foto.jpg
    alt: Foto de ${slug}
medidas:
  alto: 40
  ancho: 30
tecnica: óleo
año: 2024
estado: disponible
---
`;
