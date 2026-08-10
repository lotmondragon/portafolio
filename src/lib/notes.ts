import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Notas publicadas, ordenadas de más reciente a más antigua. `borrador: true`
 * solo se excluye en producción — en `astro dev` se ven los borradores para
 * poder revisarlos antes de publicar.
 */
export async function getPublishedNotes(): Promise<CollectionEntry<'notas'>[]> {
  const notes = await getCollection('notas', ({ data }) => import.meta.env.PROD ? data.borrador !== true : true);
  return notes.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}
