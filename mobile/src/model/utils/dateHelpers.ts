/**
 * Helpers de dates centralisés — semaine ISO (lundi = premier jour).
 */

/** Retourne le lundi 00:00:00 de la semaine contenant `date`. */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

/** Variante timestamp (ms) → timestamp (ms). */
export function getMondayOfWeekTs(ts: number): number {
  return getMondayOfWeek(new Date(ts)).getTime()
}

/** Lundi de la semaine courante en timestamp ms. */
export function getMondayOfCurrentWeek(): number {
  return getMondayOfWeek(new Date()).getTime()
}
