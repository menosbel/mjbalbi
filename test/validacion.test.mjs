import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

// Each fixture is a valid Obra except for one problem; the build must fail
// and the message must point at the offending field or file.
const casos = [
  { fixture: 'invalidas-foto-sin-alt', problema: 'una foto sin texto alternativo', mensaje: /fotos\.0\.alt/ },
  { fixture: 'invalidas-tecnica-inexistente', problema: 'una Técnica que no existe', mensaje: /tecnica: Invalid option/ },
  { fixture: 'invalidas-estado-inexistente', problema: 'un Estado que no existe', mensaje: /estado: Invalid option/ },
  { fixture: 'invalidas-falta-titulo', problema: 'un campo obligatorio faltante', mensaje: /titulo: Required/ },
  { fixture: 'invalidas-slug-repetido', problema: 'dos Obras con el mismo slug', mensaje: /mismo slug "repetida"/ },
  { fixture: 'invalidas-serie-inexistente', problema: 'una Serie que no existe', mensaje: /Serie "no-existe", que no existe/ },
];

describe('el build falla con una Obra mal cargada', () => {
  for (const { fixture, problema, mensaje } of casos) {
    test(problema, async () => {
      const site = await buildSite(fixture);
      assert.equal(site.ok, false, `el build no falló:\n${site.output}`);
      assert.match(site.output, mensaje);
    });
  }
});
