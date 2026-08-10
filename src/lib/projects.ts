import { getCollection, type CollectionEntry } from 'astro:content';

/** Los archivos se nombran "01-slug.mdx" para ordenarlos en el filesystem;
 * la URL pública no lleva ese prefijo numérico. */
export function projectSlug(id: string): string {
  return id.replace(/^\d+-/, '');
}

export async function getSortedProjects(): Promise<CollectionEntry<'proyectos'>[]> {
  const proyectos = await getCollection('proyectos');
  return proyectos.sort((a, b) => a.data.numero.localeCompare(b.data.numero));
}
