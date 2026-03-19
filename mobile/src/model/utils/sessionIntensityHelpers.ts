import type { ThemeColors } from '../../theme'

export interface IntensityBreakdown {
  volumeScore: number   // 0-33
  prScore: number       // 0-33
  effortScore: number   // 0-34
}

export interface IntensityResult {
  score: number                                          // 0-100
  label: 'light' | 'moderate' | 'intense' | 'extreme'   // clé i18n
  color: string                                          // couleur dynamique
  breakdown: IntensityBreakdown
}

interface ExerciseForIntensity {
  sets: { weight: number; reps: number }[]
  prevMaxWeight: number
}

/**
 * Calcule le score d'intensité d'une séance.
 * Éphémère — pas de DB, calculé à la volée depuis les données disponibles dans WorkoutSummarySheet.
 *
 * @param totalVolume - volume total de la séance (Σ weight × reps)
 * @param totalPrs - nombre de PRs réalisés dans la séance
 * @param recapExercises - données par exercice : sets + max historique (prevMaxWeight)
 * @param colors - couleurs du thème pour la couleur de niveau
 */
export function computeSessionIntensity(
  totalVolume: number,
  totalPrs: number,
  recapExercises: ExerciseForIntensity[],
  colors: Pick<ThemeColors, 'textSecondary' | 'primary' | 'danger' | 'amber'>,
): IntensityResult {
  // 1. volumeScore (0-33) : linéaire entre 500 kg et 10 000 kg
  const volumeScore =
    totalVolume <= 500
      ? 0
      : totalVolume >= 10000
        ? 33
        : Math.round(((totalVolume - 500) / (10000 - 500)) * 33)

  // 2. prScore (0-33) : 0 PR = 0, 1 = 11, 2 = 22, 3+ = 33
  const prScore = totalPrs === 0 ? 0 : totalPrs === 1 ? 11 : totalPrs === 2 ? 22 : 33

  // 3. effortScore (0-34) : ratio des sets à ≥ 80 % du max historique
  let effortScore = 0
  const allSetsFlat = recapExercises.flatMap(e =>
    e.sets.map(s => ({ weight: s.weight, prevMaxWeight: e.prevMaxWeight })),
  )
  const totalSets = allSetsFlat.length
  if (totalSets > 0) {
    const highEffortCount = allSetsFlat.filter(
      s => s.prevMaxWeight > 0 && s.weight >= s.prevMaxWeight * 0.8,
    ).length
    effortScore = Math.round((highEffortCount / totalSets) * 34)
  }

  const score = Math.min(100, volumeScore + prScore + effortScore)

  const label: IntensityResult['label'] =
    score < 30 ? 'light' : score < 55 ? 'moderate' : score < 80 ? 'intense' : 'extreme'

  const color =
    label === 'light'
      ? colors.textSecondary
      : label === 'moderate'
        ? colors.primary
        : label === 'intense'
          ? colors.amber
          : colors.danger

  return { score, label, color, breakdown: { volumeScore, prScore, effortScore } }
}
