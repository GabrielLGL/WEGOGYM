/**
 * Validation helpers - Fonctions utilitaires pour valider les entrées utilisateur
 *
 * Remplace les validations inline répétées dans les screens.
 * Centralise la logique de validation pour cohérence et maintenabilité.
 */

import { MIN_REPS, MAX_REPS } from '../constants'

/**
 * Vérifie si un texte est valide (non vide après trim)
 *
 * @param text - Texte à valider
 * @returns true si le texte est valide
 *
 * @example
 * if (!isValidText(programName)) {
 *   alert('Le nom ne peut pas être vide')
 * }
 */
export function isValidText(text: string): boolean {
  return text.trim() !== ''
}

/**
 * Vérifie si une valeur numérique est valide
 *
 * @param value - Valeur (string ou number) à valider
 * @param min - Valeur minimale autorisée (défaut: > 0)
 * @returns true si la valeur est un nombre valide >= min
 *
 * @example
 * if (!isValidNumeric(targetSets, 1)) {
 *   alert('Le nombre de séries doit être au moins 1')
 * }
 */
export function isValidNumeric(value: string | number, min: number = 0): boolean {
  const num = typeof value === 'string' ? Number(value) : value

  if (isNaN(num)) return false
  if (num <= min) return false

  return true
}

/**
 * Valide les entrées d'un workout (sets, reps, weight)
 *
 * @param sets - Nombre de séries (string)
 * @param reps - Nombre de répétitions (string) — entier "N" ou range "N-M" (ex: "8" ou "6-8")
 * @param weight - Poids (string, optionnel)
 * @returns Objet { valid: boolean, errors: string[] }
 *
 * @example
 * const validation = validateWorkoutInput(targetSets, targetReps, targetWeight)
 * if (!validation.valid) {
 *   alert(validation.errors.join('\n'))
 * }
 */
export function validateWorkoutInput(
  sets: string,
  reps: string,
  weight?: string,
  setsMax?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validation des séries
  if (!sets.trim() || sets === '0') {
    errors.push('Le nombre de séries est requis et doit être supérieur à 0')
  } else if (!isValidNumeric(sets, 0)) {
    errors.push('Le nombre de séries doit être un nombre valide')
  }

  // Validation des répétitions (entier OU range "N-M")
  if (!reps.trim()) {
    errors.push('Le nombre de répétitions est requis')
  } else {
    const repsParts = reps.split('-')
    if (repsParts.length === 1) {
      const n = parseInt(repsParts[0], 10)
      if (isNaN(n) || n < MIN_REPS || n > MAX_REPS) {
        errors.push('Le nombre de répétitions doit être un entier entre 1 et 99')
      }
    } else if (repsParts.length === 2) {
      const rMin = parseInt(repsParts[0], 10)
      const rMax = parseInt(repsParts[1], 10)
      if (isNaN(rMin) || isNaN(rMax) || rMin < MIN_REPS || rMax < MIN_REPS || rMin > MAX_REPS || rMax > MAX_REPS) {
        errors.push('La range de reps doit être entre 1 et 99')
      } else if (rMin > rMax) {
        errors.push('Le min de reps doit être ≤ au max')
      }
    } else {
      errors.push('Format de reps invalide — utiliser un entier ou une range (ex: 6-8)')
    }
  }

  // Validation du poids (optionnel mais doit être valide si fourni)
  if (weight !== undefined && weight.trim() !== '') {
    if (!isValidNumeric(weight, -1)) {
      // -1 pour permettre 0
      errors.push('Le poids doit être un nombre valide')
    }
  }

  // Validation du max de séries (optionnel, doit être ≥ min si fourni)
  if (setsMax !== undefined && setsMax.trim() !== '') {
    const setsMaxNum = parseInt(setsMax, 10)
    const setsNum = parseInt(sets, 10)
    if (isNaN(setsMaxNum)) {
      errors.push('Le max de séries doit être un nombre valide')
    } else if (!isNaN(setsNum) && setsMaxNum < setsNum) {
      errors.push('Le max de séries doit être ≥ au min')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Valide les inputs d'une serie en seance en direct (poids + reps reels)
 *
 * @param weight - Poids saisi (string) - doit etre >= 0
 * @param reps - Repetitions saisies (string) - doit etre un entier >= 1
 * @returns { valid, errors }
 *
 * @example
 * const { valid } = validateSetInput('80', '10')   // true
 * const { valid } = validateSetInput('-5', '10')   // false (poids negatif)
 * const { valid } = validateSetInput('80', '0')    // false (reps < 1)
 */
export function validateSetInput(
  weight: string,
  reps: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const weightNum = Number(weight)
  if (weight.trim() === '' || isNaN(weightNum) || weightNum < 0) {
    errors.push('Le poids doit être un nombre valide (>= 0)')
  }

  const repsNum = Number(reps)
  if (reps.trim() === '' || isNaN(repsNum) || repsNum < 1) {
    errors.push('Les répétitions doivent être >= 1')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valide qu'au moins un muscle est sélectionné
 *
 * @param muscles - Tableau de muscles sélectionnés
 * @returns true si au moins un muscle est sélectionné
 */
export function validateMuscles(muscles: string[]): boolean {
  return muscles.length > 0
}

/**
 * Valide les données d'un exercice personnalisé
 *
 * @param name - Nom de l'exercice
 * @param muscles - Muscles ciblés
 * @param equipment - Équipement requis
 * @returns Objet { valid: boolean, errors: string[] }
 */
export function validateExerciseInput(
  name: string,
  muscles: string[],
  equipment: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isValidText(name)) {
    errors.push('Le nom de l\'exercice est requis')
  }

  if (!validateMuscles(muscles)) {
    errors.push('Au moins un muscle doit être sélectionné')
  }

  if (!isValidText(equipment)) {
    errors.push('L\'équipement est requis')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
