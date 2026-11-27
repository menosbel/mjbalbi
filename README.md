# mjbalbi

Sitio de la artista María Julia Balbi, generado con [Astro](https://astro.build) y
publicado en GitHub Pages. El contenido vive en el repo (ver
`docs/adr/0001-contenido-en-git-con-astro.md`) y el vocabulario en `GLOSSARY.md`.

## Correr el sitio

```sh
nvm use          # Node según .nvmrc
npm install
npm run dev      # http://localhost:4321/mjbalbi/
npm run build    # genera dist/
npm run preview  # sirve dist/
```

## Tests

```sh
npm test
```

Los tests usan `node:test`. Cada uno corre `astro build` sobre un directorio de
contenido de prueba (`test/fixtures/<nombre>/`) y revisa el HTML generado. Para
probar un caso nuevo, se agrega un fixture y se usa `buildSite('<nombre>')` de
`test/harness.mjs`.

## Configuración

Todo lo que depende de dónde se publica está en `site.config.mjs`: URL del sitio,
`base` path (`/mjbalbi` en GitHub Pages, vacío con dominio propio) y directorio de
contenido. Algunos valores se pueden pisar con variables de entorno (`SITE_URL`,
`SITE_BASE`, `CONTENT_DIR`).

## Cargar una Obra

Cada **Obra** es una carpeta dentro de `contenido/obras/` con un `index.md` y sus
fotos al lado (JPEG de hasta unos 2400 px del lado largo):

```
contenido/obras/atardecer-en-el-rio/
├── index.md
├── frente.jpg
└── detalle.jpg
```

El nombre de la carpeta es el slug, es decir, la URL de la **Obra**
(`/obras/atardecer-en-el-rio/`). Se arma con el título en minúsculas, sin tildes y con
guiones. Si el título se repite, se agrega `-02`, `-03`… Las "Sin título" se numeran
siempre: `sin-titulo-01`, `sin-titulo-02`… Una vez publicado, el slug no se cambia.
También se puede usar un solo archivo (`contenido/obras/<slug>.md`) con las fotos en
la misma carpeta.

```md
---
titulo: Atardecer en el río
fotos:                    # al menos una; la primera es la principal
  - src: ./frente.jpg
    alt: Un río ancho bajo un cielo naranja   # obligatorio
  - src: ./detalle.jpg
    alt: Detalle de las pinceladas del agua
medidas:                  # en cm
  alto: 60
  ancho: 80
  profundidad: 3          # opcional
tecnica: óleo             # óleo | acrílico | pastel
soporte: lienzo           # opcional
año: 2024
enmarcada: true           # opcional
estado: disponible        # disponible | reservada | vendida
destacada: false          # opcional, por defecto false
---

La descripción de la Obra va acá, en Markdown.
```

Si falta un campo obligatorio, una foto no tiene `alt`, la **Técnica** o el
**Estado** no existen o dos **Obras** tienen el mismo slug, el build falla y el
mensaje dice qué corregir. El precio no se carga: el sitio siempre dice
"Consultar precio".

## Sobre mí

La página `/sobre-mi/` se arma con tres archivos de `contenido/sobre-mi/`:

- `biografia.md`: la biografía, en Markdown.
- `statement.md`: el **Statement**, en Markdown.
- `trayectoria.md`: la **Trayectoria**, en el frontmatter, separada en formación,
  exposiciones y premios (cada lista es opcional):

```md
---
formacion:
  - año: 2008–2012
    texto: Profesorado de Artes Visuales, Escuela de Bellas Artes
exposiciones:
  - año: 2019
    texto: Muestra individual "Orillas", Galería del Puerto
premios:
  - año: 2021
    texto: Primer premio, Salón de Pintura de Rosario
---
```

Dentro de esos textos no se usan títulos de nivel 1 (`#`): la página ya tiene el suyo.

## Publicar

Cada push a `main` corre `.github/workflows/pages.yml`: instala dependencias, corre
los tests, hace el build de Astro y publica `dist/` en GitHub Pages:
https://menosbel.github.io/mjbalbi/

Para pasar a un dominio propio, se cambian `url` y `base` en `site.config.mjs`.
