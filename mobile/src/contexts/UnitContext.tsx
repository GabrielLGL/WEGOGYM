import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { database } from '../model'
import { fetchCurrentUser } from '../model/utils/databaseHelpers'
import {
  type UnitMode,
  convertWeight as _convertWeight,
  convertWeightToMetric,
  getWeightUnit,
  formatWeight as _formatWeight,
  resolveUnitMode,
} from '../model/utils/unitHelpers'

interface UnitContextValue {
  unitMode: UnitMode
  /** 'kg' ou 'lbs' */
  weightUnit: string
  /** Convertit un poids DB (kg) vers l'unité d'affichage */
  convertWeight: (kg: number) => number
  /** Convertit un poids saisi par l'utilisateur vers kg (pour stockage DB) */
  convertToMetric: (value: number) => number
  /** Formate un poids avec son unité : "80 kg" ou "176.4 lbs" */
  formatWeight: (kg: number) => string
  setUnitMode: (mode: UnitMode) => Promise<void>
}

const UnitContext = createContext<UnitContextValue | null>(null)

interface UnitProviderProps {
  children: React.ReactNode
  initialMode?: UnitMode
}

export function UnitProvider({ children, initialMode = 'metric' }: UnitProviderProps) {
  const [unitMode, setMode] = useState<UnitMode>(initialMode)

  const persistUnit = useCallback(async (mode: UnitMode): Promise<boolean> => {
    try {
      const user = await fetchCurrentUser()
      if (!user) return true
      await database.write(async () => {
        await user.update(u => { u.unitMode = mode })
      })
      return true
    } catch (error) {
      if (__DEV__) console.error('[UnitContext] persist error:', error)
      return false
    }
  }, [])

  const setUnitMode = useCallback(async (mode: UnitMode) => {
    const previous = unitMode
    setMode(mode)
    const success = await persistUnit(mode)
    if (!success) setMode(previous)
  }, [unitMode, persistUnit])

  const value = useMemo<UnitContextValue>(() => ({
    unitMode,
    weightUnit: getWeightUnit(unitMode),
    convertWeight: (kg: number) => _convertWeight(kg, unitMode),
    convertToMetric: (val: number) => convertWeightToMetric(val, unitMode),
    formatWeight: (kg: number) => _formatWeight(kg, unitMode),
    setUnitMode,
  }), [unitMode, setUnitMode])

  return (
    <UnitContext.Provider value={value}>
      {children}
    </UnitContext.Provider>
  )
}

export function useUnits(): UnitContextValue {
  const ctx = useContext(UnitContext)
  if (!ctx) throw new Error('useUnits() appelé hors UnitProvider')
  return ctx
}

export { type UnitMode }
