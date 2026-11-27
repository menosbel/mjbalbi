# mjbalbi

Sitio de María Julia Balbi: muestra sus Obras para que los interesados la contacten y las compren.
Sitio estático hecho con [Astro](https://astro.build); el contenido vive en Markdown dentro del repo
(ver `docs/adr/0001-contenido-en-git-con-astro.md` y el vocabulario en `GLOSSARY.md`).

## Desarrollo local

```sh
nvm use        # ver .nvmrc
npm install
npm run dev    # http://localhost:4321/mjbalbi/
npm run build  # genera dist/ (falla si una Obra está mal cargada)
```

## Cargar contenido

| Qué | Dónde |
| --- | --- |
| Email, Instagram, ciudad | `src/config.ts` |
| Biografía, Statement, Trayectoria | `src/content/artista.md` |
| Una Obra | `src/content/obras/<slug>/index.md` + `foto.jpg` en la misma carpeta |
| Una Serie | `src/content/series/<slug>.md` |

Para sumar una Obra, copiá una carpeta existente de `src/content/obras/`, cambiá el nombre de la
carpeta (es la URL: `/obras/<slug>/`) y editá el `index.md`:

```yaml
titulo: Marea baja
foto: ./foto.jpg          # JPEG de hasta ~2400 px del lado largo; Astro genera los tamaños menores
alt: Descripción de lo que se ve en la pintura   # importante para SEO y accesibilidad
tecnica: oleo             # oleo | acrilico | pastel
soporte: Lienzo
alto: 100                 # en cm
ancho: 80                 # en cm
anio: 2025                # opcional
serie: orillas            # opcional: nombre del archivo de la Serie, sin .md
estado: disponible        # disponible | reservada | vendida
destacada: true           # aparece en el inicio
orden: 1                  # menor primero
```

Debajo del frontmatter va la descripción de la Obra en texto libre.

## SEO y GEO

- Cada Obra tiene su página con título, meta descripción, Open Graph y datos estructurados
  `VisualArtwork` (técnica, soporte, medidas en cm, año, autora).
- La artista se describe como `Person` (con su Instagram en `sameAs`) en todas las páginas.
- Hay páginas por Técnica (`/obras/oleo/`, `/obras/acrilico/`, `/obras/pastel/`).
- Se generan `sitemap-index.xml`, `robots.txt` y `llms.txt` (resumen para asistentes de IA).

## Deploy

Cada push a `main` buildea el sitio y publica `dist/` en GitHub Pages mediante
`.github/workflows/pages.yml`: https://menosbel.github.io/mjbalbi/

Con dominio propio: cambiar `site` y borrar `base` en `astro.config.mjs`. Recién ahí `robots.txt`
y `llms.txt` quedan en la raíz del dominio, que es donde los buscan los rastreadores.
