import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';

const FORMATO_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Glob loader for a collection whose entries are `<slug>.md` or
 * `<slug>/index.md`. The slug is the file or folder name, as is (see the slug
 * convention in #4). The build fails if a name doesn't follow the convention
 * or if two entries end up with the same slug.
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
