import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import { buildSite } from './harness.mjs';

/** Reads the Obra's data list (<dl> inside <main>) into { término: valor }. */
function datos(page) {
  const dl = page.querySelector('main dl');
  assert.ok(dl, 'la página no tiene una lista de datos <dl>');
  const result = {};
  for (const dt of dl.querySelectorAll('dt')) {
    result[dt.text.trim()] = dt.nextElementSibling.text.trim().replace(/\s+/g, ' ');
  }
  return result;
}

describe('página de una Obra', () => {
  let site;
  before(async () => {
    site = await buildSite('obras-validas');
    assert.ok(site.ok, site.output);
  });

  describe('con todos los datos', () => {
    let page;
    before(() => {
      page = site.page('/obras/atardecer-en-el-rio/');
    });

    test('se genera en /obras/<slug>/ con el título como h1', () => {
      assert.equal(page.querySelector('h1')?.text.trim(), 'Atardecer en el río');
    });

    test('muestra medidas, Técnica, Soporte, año y si está enmarcada', () => {
      assert.deepEqual(datos(page), {
        Medidas: '60 × 80 × 3 cm',
        Técnica: 'Óleo',
        Soporte: 'Lienzo',
        Año: '2024',
        Enmarcada: 'Sí',
      });
    });

    test('muestra la descripción', () => {
      assert.match(page.querySelector('main').text, /el agua se vuelve cobre/);
    });

    test('muestra la etiqueta de su Estado', () => {
      assert.equal(page.querySelector('main .estado')?.text.trim(), 'Disponible');
    });

    test('dice "Consultar precio" y no muestra ningún precio', () => {
      const texto = page.querySelector('main').text;
      assert.match(texto, /Consultar precio/);
      assert.doesNotMatch(texto, /\$|USD|ARS|€/);
    });
  });

  describe('sin los datos opcionales', () => {
    let page;
    before(() => {
      page = site.page('/obras/sin-titulo-01/');
    });

    test('toma el slug del nombre del archivo', () => {
      assert.equal(page.querySelector('h1')?.text.trim(), 'Sin título');
    });

    test('muestra solo alto × ancho y omite Soporte y enmarcada', () => {
      assert.deepEqual(datos(page), {
        Medidas: '30 × 30 cm',
        Técnica: 'Pastel',
        Año: '2019',
      });
    });

    test('muestra la etiqueta Vendida y "Consultar precio"', () => {
      assert.equal(page.querySelector('main .estado')?.text.trim(), 'Vendida');
      assert.match(page.querySelector('main').text, /Consultar precio/);
    });
  });
});
