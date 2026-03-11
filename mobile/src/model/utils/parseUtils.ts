/**
 * parseUtils.ts — Fonctions pures de parsing et formatage de dates
 * Aucune dépendance DB.
 */

/**
 * Parse une valeur numérique (string) en number avec fallback
 *
 * @param value - Valeur string à parser
 * @param fallback - Valeur par défaut si parsing échoue (défaut: 0)
 * @returns Nombre parsé ou fallback
 *
 * @example
 * const sets = parseNumericInput(targetSets, 0)
 * const weight = parseNumericInput(targetWeight, 0)
 */
export function parseNumericInput(value: string, fallback: number = 0): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Parse une valeur entière (string) en integer avec fallback
 *
 * @param value - Valeur string à parser
 * @param fallback - Valeur par défaut si parsing échoue (défaut: 0)
 * @returns Entier parsé ou fallback
 *
 * @example
 * const sets = parseIntegerInput(targetSets, 1)
 */
export function parseIntegerInput(value: string, fallback: number = 0): number {
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Formate une date en temps relatif lisible
 *
 * @param date - Date a formater
 * @returns "aujourd'hui" | "hier" | "il y a N jours"
 *
 * @example
 * formatRelativeDate(new Date(Date.now() - 3 * 86400000)) // "il y a 3 jours"
 */
/**
 * Formate des secondes en MM:SS (ex: 125 → "02:05")
 */
export function formatSecondsToMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const oneDayMs = 24 * 3600 * 1000

  if (diffMs < oneDayMs) return "aujourd'hui"
  if (diffMs < 2 * oneDayMs) return 'hier'
  return `il y a ${Math.floor(diffMs / oneDayMs)} jours`
}
