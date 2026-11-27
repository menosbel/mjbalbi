// Test harness: builds the Astro site over a fixture content directory and
// exposes the generated HTML. This is the only seam the tests use (see #4).
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const astroBin = join(root, 'node_modules/astro/bin/astro.mjs');
const cache = new Map();

/**
 * Builds the site with `test/fixtures/<fixture>` as content directory.
 * Builds are memoized per (fixture, base, env) within a test file.
 *
 * @param {string} fixture  name of a directory under test/fixtures, or an absolute content dir
 * @param {{ base?: string, env?: Record<string, string> }} [options]
 *   base: the site's `base` path ('' or '/mjbalbi'); defaults to ''.
 *   env:  extra environment variables for the build.
 * @returns {Promise<Site>}
 */
export function buildSite(fixture, { base = '', env = {} } = {}) {
  const key = JSON.stringify([fixture, base, env]);
  if (!cache.has(key)) cache.set(key, runBuild(fixture, base, env));
  return cache.get(key);
}

async function runBuild(fixture, base, env) {
  const contentDir = isAbsolute(fixture) ? fixture : join(root, 'test/fixtures', fixture);
  if (!existsSync(contentDir)) throw new Error(`No existe el fixture ${contentDir}`);
  const work = mkdtempSync(join(tmpdir(), `mjbalbi-${basename(fixture)}-`));
  const outDir = join(work, 'dist');
  const { code, output } = await run(
    process.execPath,
    [astroBin, 'build', '--outDir', outDir],
    {
      ...process.env,
      CONTENT_DIR: contentDir,
      SITE_BASE: base,
      // A per-build cache keeps the content store of one fixture from leaking into another.
      ASTRO_CACHE_DIR: join(work, 'cache'),
      ASTRO_TELEMETRY_DISABLED: '1',
      ...env,
    },
  );
  return new Site({ ok: code === 0, output, outDir, base });
}

function run(cmd, args, env) {
  return new Promise((done, fail) => {
    const child = spawn(cmd, args, { cwd: root, env });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('error', fail);
    child.on('close', (code) => done({ code, output }));
  });
}

export class Site {
  constructor({ ok, output, outDir, base }) {
    /** true if `astro build` exited with code 0 */
    this.ok = ok;
    /** stdout + stderr of the build, useful in assertion messages */
    this.output = output;
    this.outDir = outDir;
    this.base = base;
  }

  /** Path of the generated file for a site path such as '/obras/foo/'. */
  fileFor(sitePath) {
    const clean = sitePath.replace(/^\//, '');
    return join(this.outDir, clean.endsWith('/') || clean === '' ? `${clean}index.html` : clean);
  }

  /** Whether the site path (without base) was generated. */
  exists(sitePath) {
    return existsSync(this.fileFor(sitePath));
  }

  /** Site paths (without base) of every generated HTML page, e.g. ['/', '/obras/foo/']. */
  pages() {
    if (!this.ok) throw new Error(`El build falló:\n${this.output}`);
    return readdirSync(this.outDir, { recursive: true })
      .filter((f) => f.endsWith('.html'))
      .map((f) => `/${f.split(sep).join('/')}`.replace(/index\.html$/, ''))
      .sort();
  }

  /** Parsed HTML (node-html-parser root) of a site path, without base. */
  page(sitePath) {
    if (!this.ok) throw new Error(`El build falló:\n${this.output}`);
    const file = this.fileFor(sitePath);
    if (!existsSync(file)) throw new Error(`No se generó ${sitePath}`);
    return parse(readFileSync(file, 'utf8'));
  }

  /**
   * Resolves a URL found in the HTML (href/src/srcset item) to the generated
   * file, checking that it starts with the base path. Returns null if the URL
   * is outside the base or the file does not exist.
   */
  resolveUrl(url) {
    if (/^[a-z]+:/i.test(url)) return null;
    const prefix = `${this.base}/`;
    if (!url.startsWith(prefix)) return null;
    const file = this.fileFor(url.slice(this.base.length).split(/[?#]/)[0]);
    return existsSync(file) ? file : null;
  }
}

/**
 * CSS rules that apply to the page (inline <style> plus linked stylesheets),
 * as { selector, cuerpo, media } with media = the @media condition or null.
 */
export function reglasCss(site, page) {
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
