/**
 * Validation helpers - Fonctions utilitaires pour valider les entrées utilisateur
 *
 * Remplace les validations inline répétées dans les screens.
 * Centralise la logique de validation pour cohérence et maintenabilité.
 */

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
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return false
  if (num <= min) return false

  return true
}

/**
 * Valide les entrées d'un workout (sets, reps, weight)
 *
 * @param sets - Nombre de séries (string)
 * @param reps - Nombre de répétitions (string)
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
  weight?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validation des séries
  if (!sets.trim() || sets === '0') {
    errors.push('Le nombre de séries est requis et doit être supérieur à 0')
  } else if (!isValidNumeric(sets, 0)) {
    errors.push('Le nombre de séries doit être un nombre valide')
  }

  // Validation des répétitions
  if (!reps.trim() || reps === '0') {
    errors.push('Le nombre de répétitions est requis et doit être supérieur à 0')
  } else if (!isValidNumeric(reps, 0)) {
    errors.push('Le nombre de répétitions doit être un nombre valide')
  }

  // Validation du poids (optionnel mais doit être valide si fourni)
  if (weight !== undefined && weight.trim() !== '') {
    if (!isValidNumeric(weight, -1)) {
      // -1 pour permettre 0
      errors.push('Le poids doit être un nombre valide')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
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
