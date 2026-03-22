/**
 * Mock global pour UnitContext — utilisé dans les tests Jest.
 * Évite la dépendance transitoire UnitContext → database → SQLiteAdapter.
 * Retourne le mode métrique par défaut (kg).
 * Les fonctions sont des constantes stables pour éviter les boucles infinies
 * dans les useEffect qui dépendent de convertWeight/convertToMetric.
 */
import type { UnitMode } from '../src/model/utils/unitHelpers'

const stableConvertWeight = (kg: number) => kg
const stableConvertToMetric = (val: number) => val
const stableFormatWeight = (kg: number) => `${kg} kg`
const stableSetUnitMode = jest.fn().mockResolvedValue(undefined)

export function useUnits() {
  return {
    unitMode: 'metric' as UnitMode,
    weightUnit: 'kg',
    convertWeight: stableConvertWeight,
    convertToMetric: stableConvertToMetric,
    formatWeight: stableFormatWeight,
    setUnitMode: stableSetUnitMode,
  }
}

export function UnitProvider({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}

export type { UnitMode }
