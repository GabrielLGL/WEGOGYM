/**
 * monthlyBulletinHelpers — Calcul du bulletin mensuel gamifié
 *
 * Attribue des notes A+/A/B+/B/C+/C/D par catégorie selon les percentiles
 * du mois courant par rapport à la moyenne des mois précédents.
 *
 * Catégories : régularité (séances), force (PRs), volume (tonnage), équilibre (groupes musculaires)
 */

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type { Language } from '../../i18n'
import { translations } from '../../i18n'

export type GradePlus = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D'

export interface MonthlyGrade {
  category: 'regularite' | 'force' | 'volume' | 'equilibre'
  grade: GradePlus
  value: number     // valeur brute ce mois
  avg: number       // moyenne des mois précédents
  pctVsAvg: number  // % vs moyenne (peut être négatif)
}

export interface MonthlyBulletin {
  month: string       // ex: "Mars 2026"
  monthIndex: number  // 0-11
  year: number
  grades: MonthlyGrade[]
  overallGrade: GradePlus
  comment: string     // commentaire auto généré
}

function assignGrade(value: number, avg: number): { grade: GradePlus; pctVsAvg: number } {
  if (avg === 0) {
    return { grade: value > 0 ? 'A+' : 'D', pctVsAvg: value > 0 ? 130 : 0 }
  }
  const pct = (value / avg) * 100
  let grade: GradePlus
  if (pct >= 130) grade = 'A+'
  else if (pct >= 110) grade = 'A'
  else if (pct >= 90) grade = 'B+'
  else if (pct >= 70) grade = 'B'
  else if (pct >= 50) grade = 'C+'
  else if (pct >= 30) grade = 'C'
  else grade = 'D'
  return { grade, pctVsAvg: Math.round(pct - 100) }
}

function gradeToNumber(grade: GradePlus): number {
  const map: Record<GradePlus, number> = { 'A+': 6, A: 5, 'B+': 4, B: 3, 'C+': 2, C: 1, D: 0 }
  return map[grade]
}

function numberToGrade(n: number): GradePlus {
  const grades: GradePlus[] = ['D', 'C', 'C+', 'B', 'B+', 'A', 'A+']
  return grades[Math.max(0, Math.min(6, Math.round(n)))]
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function formatMonthName(year: number, monthIndex: number, language: Language): string {
  const date = new Date(year, monthIndex, 1)
  const locale = language === 'fr' ? 'fr-FR' : 'en-US'
  const month = date.toLocaleString(locale, { month: 'long' })
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`
}

/**
 * Calcule le bulletin du mois en cours.
 * Retourne null si moins de 2 mois de données.
 */
export function computeMonthlyBulletin(
  histories: History[],
  sets: WorkoutSet[],
  exercises: Exercise[],
  language: Language,
): MonthlyBulletin | null {
  if (histories.length === 0) return null

  // Maps de lookup
  const exerciseMap = new Map<string, Exercise>()
  for (const ex of exercises) exerciseMap.set(ex.id, ex)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentKey = getMonthKey(now)

  // Grouper les historiques par mois
  const historiesByMonth = new Map<string, History[]>()
  for (const h of histories) {
    const key = getMonthKey(h.startTime)
    if (!historiesByMonth.has(key)) historiesByMonth.set(key, [])
    historiesByMonth.get(key)!.push(h)
  }

  const previousMonthKeys = Array.from(historiesByMonth.keys()).filter(k => k !== currentKey)
  if (previousMonthKeys.length === 0) return null

  // Grouper les sets par historyId
  const setsByHistoryId = new Map<string, WorkoutSet[]>()
  for (const s of sets) {
    if (!setsByHistoryId.has(s.historyId)) setsByHistoryId.set(s.historyId, [])
    setsByHistoryId.get(s.historyId)!.push(s)
  }

  function computeMetrics(monthHistories: History[]) {
    let prs = 0
    let tonnage = 0
    const muscleGroups = new Set<string>()
    for (const h of monthHistories) {
      const hSets = setsByHistoryId.get(h.id) ?? []
      for (const s of hSets) {
        if (s.isPr) prs++
        tonnage += s.weight * s.reps
        const ex = exerciseMap.get(s.exerciseId)
        if (ex) for (const m of ex.muscles) muscleGroups.add(m)
      }
    }
    return {
      regularite: monthHistories.length,
      force: prs,
      volume: tonnage,
      equilibre: muscleGroups.size,
    }
  }

  const currentHistories = historiesByMonth.get(currentKey) ?? []
  const currentMetrics = computeMetrics(currentHistories)

  const prevMetricsList = previousMonthKeys.map(k => computeMetrics(historiesByMonth.get(k)!))
  const len = prevMetricsList.length
  const avgMetrics = {
    regularite: prevMetricsList.reduce((sum, m) => sum + m.regularite, 0) / len,
    force: prevMetricsList.reduce((sum, m) => sum + m.force, 0) / len,
    volume: prevMetricsList.reduce((sum, m) => sum + m.volume, 0) / len,
    equilibre: prevMetricsList.reduce((sum, m) => sum + m.equilibre, 0) / len,
  }

  const categories: Array<'regularite' | 'force' | 'volume' | 'equilibre'> = [
    'regularite', 'force', 'volume', 'equilibre',
  ]

  const grades: MonthlyGrade[] = categories.map(cat => {
    const value = currentMetrics[cat]
    const avg = avgMetrics[cat]
    const { grade, pctVsAvg } = assignGrade(value, avg)
    return { category: cat, grade, value, avg, pctVsAvg }
  })

  const avgGradeNum = grades.reduce((sum, g) => sum + gradeToNumber(g.grade), 0) / grades.length
  const overallGrade = numberToGrade(avgGradeNum)

  const commentMap: Record<GradePlus, string> = {
    'A+': translations[language].bulletin.comments.aplus,
    A: translations[language].bulletin.comments.a,
    'B+': translations[language].bulletin.comments.bplus,
    B: translations[language].bulletin.comments.b,
    'C+': translations[language].bulletin.comments.cplus,
    C: translations[language].bulletin.comments.c,
    D: translations[language].bulletin.comments.d,
  }

  return {
    month: formatMonthName(currentYear, currentMonth, language),
    monthIndex: currentMonth,
    year: currentYear,
    grades,
    overallGrade,
    comment: commentMap[overallGrade],
  }
}
