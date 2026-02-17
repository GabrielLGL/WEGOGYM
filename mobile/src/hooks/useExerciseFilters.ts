import { useState, useMemo } from 'react'
import Exercise from '../model/models/Exercise'
import { filterAndSearchExercises } from '../model/utils/databaseHelpers'

/**
 * useExerciseFilters - Hook pour gérer le filtrage d'exercices
 *
 * Encapsule la logique de filtrage par muscle, équipement et recherche textuelle.
 * Utilisé dans: ExercisesScreen, SettingsScreen, ChartsScreen
 *
 * @param exercises - Liste d'exercices à filtrer
 * @returns États et setters pour les filtres + liste filtrée
 *
 * @example
 * const {
 *   searchQuery,
 *   setSearchQuery,
 *   filterMuscle,
 *   setFilterMuscle,
 *   filterEquipment,
 *   setFilterEquipment,
 *   filteredExercises,
 *   resetFilters
 * } = useExerciseFilters(exercises)
 */
export function useExerciseFilters(exercises: Exercise[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<string | null>(null)
  const [filterEquipment, setFilterEquipment] = useState<string | null>(null)

  const filteredExercises = useMemo(() => {
    return filterAndSearchExercises(exercises, {
      muscle: filterMuscle,
      equipment: filterEquipment,
      searchQuery: searchQuery,
    })
  }, [exercises, searchQuery, filterMuscle, filterEquipment])

  const resetFilters = () => {
    setSearchQuery('')
    setFilterMuscle(null)
    setFilterEquipment(null)
  }

  return {
    searchQuery,
    setSearchQuery,
    filterMuscle,
    setFilterMuscle,
    filterEquipment,
    setFilterEquipment,
    filteredExercises,
    resetFilters,
  }
}
