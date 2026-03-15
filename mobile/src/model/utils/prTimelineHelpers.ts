export interface PRTimelineEntry {
  setId: string
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: number              // timestamp ms
  previousPR: number | null // poids du PR précédent pour cet exercice
  gain: number | null       // weight - previousPR (kg)
  gainPercent: number | null // ((weight - previousPR) / previousPR) × 100
}

export interface PRTimelineMonth {
  month: string       // "Mars 2026" ou "March 2026"
  year: number
  monthIndex: number  // 0-11
  entries: PRTimelineEntry[]
  totalPRs: number
}

function toTimestamp(val: Date | number): number {
  return typeof val === 'number' ? val : val.getTime()
}

/**
 * Formate un mois en chaîne lisible ("Mars 2026").
 * Utilise la locale fr-FR par défaut.
 */
function formatMonthLabel(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1)
  const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * Extrait tous les PRs et les organise en timeline mensuelle.
 *
 * Algorithme :
 * 1. Filtrer les sets où isPr === true
 * 2. Trier par date décroissante (plus récent en premier)
 * 3. Pour chaque PR, calculer le gain par rapport au PR précédent du même exercice
 * 4. Grouper par mois (année + mois)
 * 5. Retourner trié par date décroissante
 */
export function buildPRTimeline(
  sets: Array<{ id: string; weight: number; reps: number; isPr: boolean; exerciseId: string; createdAt: Date | number }>,
  exercises: Array<{ id: string; name: string }>,
): PRTimelineMonth[] {
  // Map exerciseId → name
  const exerciseMap = new Map<string, string>()
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex.name)
  }

  // Filtrer uniquement les PRs
  const prSets = sets.filter(s => s.isPr)

  // Traiter en ordre croissant pour construire la map "PR précédent"
  const ascending = [...prSets].sort(
    (a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt),
  )

  // Map exerciseId → dernier poids PR connu
  const lastPRByExercise = new Map<string, number>()
  const prevInfoMap = new Map<string, {
    previousPR: number | null
    gain: number | null
    gainPercent: number | null
  }>()

  for (const s of ascending) {
    const prev = lastPRByExercise.get(s.exerciseId) ?? null
    const gain = prev !== null ? s.weight - prev : null
    const gainPercent =
      prev !== null && prev > 0
        ? ((s.weight - prev) / prev) * 100
        : null

    prevInfoMap.set(s.id, { previousPR: prev, gain, gainPercent })
    lastPRByExercise.set(s.exerciseId, s.weight)
  }

  // Trier en décroissant pour l'affichage
  const descending = [...prSets].sort(
    (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt),
  )

  // Construire les entries
  const entries: PRTimelineEntry[] = descending.map(s => {
    const info = prevInfoMap.get(s.id) ?? { previousPR: null, gain: null, gainPercent: null }
    return {
      setId: s.id,
      exerciseId: s.exerciseId,
      exerciseName: exerciseMap.get(s.exerciseId) ?? '—',
      weight: s.weight,
      reps: s.reps,
      date: toTimestamp(s.createdAt),
      previousPR: info.previousPR,
      gain: info.gain,
      gainPercent: info.gainPercent,
    }
  })

  // Grouper par mois (plus récent en premier)
  const monthMap = new Map<string, PRTimelineMonth>()

  for (const entry of entries) {
    const d = new Date(entry.date)
    const year = d.getFullYear()
    const monthIndex = d.getMonth()
    const key = `${year}-${monthIndex}`

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        month: formatMonthLabel(year, monthIndex),
        year,
        monthIndex,
        entries: [],
        totalPRs: 0,
      })
    }

    const group = monthMap.get(key)!
    group.entries.push(entry)
    group.totalPRs++
  }

  return Array.from(monthMap.values()).sort(
    (a, b) => b.year - a.year || b.monthIndex - a.monthIndex,
  )
}
