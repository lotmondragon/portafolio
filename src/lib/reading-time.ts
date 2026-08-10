const WORDS_PER_MINUTE = 200;

/** Minutos de lectura estimados a partir del cuerpo de la nota. No se captura a mano. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
