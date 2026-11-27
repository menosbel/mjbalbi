import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';

const FORMATO_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Loader glob para una colección cuyas entradas son `<slug>.md` o
 * `<slug>/index.md`. El slug es el nombre del archivo o de la carpeta, tal cual
 * (ver la convención de slugs en #4). El build falla si un nombre no sigue la
 * convención o si dos entradas terminan con el mismo slug.
 */
export function globPorSlug({ base, coleccion }: { base: string; coleccion: string }): Loader {
  let vistos = new Map<string, string>();
  const loader = glob({
    pattern: ['*.md', '*/index.md'],
    base,
    generateId({ entry }) {
      const slug = entry.replace(/\/index\.md$|\.md$/, '');
      if (!FORMATO_SLUG.test(slug)) {
        throw new Error(
          `${coleccion}: "${entry}" no sigue la convención de slugs (minúsculas, sin tildes, palabras separadas por guiones).`,
        );
      }
      const anterior = vistos.get(slug);
      if (anterior && anterior !== entry) {
        throw new Error(`${coleccion}: "${anterior}" y "${entry}" tienen el mismo slug "${slug}".`);
      }
      vistos.set(slug, entry);
      return slug;
    },
  });
  return {
    ...loader,
    load: (context) => {
      vistos = new Map();
      return loader.load(context);
    },
  };
}
