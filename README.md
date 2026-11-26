# mjbalbi

Sitio web estático. El contenido vive en `public/`. No tiene dependencias.

## Desarrollo local

```sh
nvm use      # Node 26 LTS (ver .nvmrc)
npm start    # http://localhost:3000
```

`server.js` sirve los archivos de `public/` usando solo módulos nativos de Node.

## Deploy

Cada push a `main` publica `public/` en GitHub Pages mediante
`.github/workflows/pages.yml`: https://menosbel.github.io/mjbalbi/
