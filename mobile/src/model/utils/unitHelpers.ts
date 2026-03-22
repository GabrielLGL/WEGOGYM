/**
 * unitHelpers — Conversion et formatage des unités de poids (kg/lbs)
 *
 * Convention : toutes les données DB sont stockées en kg.
 * La conversion se fait uniquement à l'affichage et à la saisie.
 */

export type UnitMode = 'metric' | 'imperial'

const LBS_PER_KG = 2.20462

/** Convertit un poids DB (kg) vers l'unité d'affichage */
export function convertWeight(kg: number, mode: UnitMode): number {
  if (mode === 'imperial') return Math.round(kg * LBS_PER_KG * 10) / 10
  return kg
}

/** Convertit un poids saisi par l'utilisateur vers kg (pour stockage DB) */
export function convertWeightToMetric(value: number, mode: UnitMode): number {
  if (mode === 'imperial') return Math.round((value / LBS_PER_KG) * 100) / 100
  return value
}

/** Retourne le suffixe d'unité */
export function getWeightUnit(mode: UnitMode): string {
  return mode === 'imperial' ? 'lbs' : 'kg'
}

/** Formate un poids avec son unité : "80 kg" ou "176.4 lbs" */
export function formatWeight(kg: number, mode: UnitMode): string {
  const value = convertWeight(kg, mode)
  const unit = getWeightUnit(mode)
  return `${value} ${unit}`
}

/** Résout le UnitMode depuis la valeur DB (null = metric) */
export function resolveUnitMode(dbValue: string | null): UnitMode {
  return dbValue === 'imperial' ? 'imperial' : 'metric'
}
