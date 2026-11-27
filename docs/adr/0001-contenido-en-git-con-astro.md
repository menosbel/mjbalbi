# Contenido en git, sitio estático con Astro

Las Obras y Series viven como archivos Markdown en el repo, con sus fotos al lado, y Astro genera un sitio estático que se publica en GitHub Pages. No hay base de datos ni servidor: el catálogo tiene decenas de Obras que cambian pocas veces por mes, y git ya da historial, backup y hosting gratis. Elegimos Astro en vez de Eleventy por sus content collections con esquema, que hacen fallar el build si una Obra está mal cargada, y por la optimización de imágenes integrada, clave en un sitio donde las protagonistas son las fotos.

## Consecuencias

- El backoffice previsto a futuro, para que la artista cargue Obras sola, tiene que escribir en este repo (por ejemplo, commits vía la API de GitHub) y no en una base de datos. Cada cambio se publica después de que corre la Action, en uno o dos minutos.
- Las fotos se suben como JPEG de hasta unos 2400 px del lado largo, sin Git LFS. Astro genera los tamaños menores.

## Opciones consideradas

- **Base de datos con servidor (por ejemplo, Supabase):** se descartó por la infraestructura que exige, desproporcionada para el volumen de contenido.
- **HTML escrito a mano:** se descartó porque una página por Obra y por Serie se vuelve inmanejable y no admite carga por parte de la artista.
