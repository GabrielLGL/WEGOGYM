<!-- v1.0 — 2026-02-26 -->
# Rapport — Split statsHelpers.ts — Groupe B — 20260226-1120

## Objectif
Décomposer `mobile/src/model/utils/statsHelpers.ts` (602 lignes) en modules cohérents,
sans casser aucun import existant. La stratégie : créer des sous-fichiers thématiques et
transformer `statsHelpers.ts` en **barrel de re-export** (`export * from './...'`).

## Fichiers concernés
- `mobile/src/model/utils/statsHelpers.ts` ← à transformer en barrel
- `mobile/src/model/utils/__tests__/statsHelpers.test.ts` ← NE PAS MODIFIER (imports corrects via barrel)
- Nouveaux fichiers à créer dans `mobile/src/model/utils/` :
  - `statsTypes.ts`
  - `statsDateUtils.ts`
  - `statsKPIs.ts`
  - `statsDuration.ts`
  - `statsVolume.ts`
  - `statsMuscle.ts`
  - `statsPRs.ts`

## Contexte technique
- Stack : React Native + TypeScript + WatermelonDB
- `statsHelpers.ts` est 100% **fonctions pures** — aucune opération DB, aucun mock nécessaire
- Les fonctions reçoivent des arrays de modèles WatermelonDB en paramètres (History, WorkoutSet, Exercise...)
- Pattern soft-delete partout : `histories.filter(h => h.deletedAt === null)`
- `StatsPeriod` = `'1m' | '3m' | 'all'`

### Importeurs actuels (NE PAS CASSER)
```
components/HeatmapCalendar.tsx      → type HeatmapDay
screens/HomeScreen.tsx              → computeGlobalKPIs, computeMotivationalPhrase, formatVolume, buildHeatmapData
screens/StatsCalendarScreen.tsx     → plusieurs fonctions + types
screens/StatsDurationScreen.tsx     → computeDurationStats, formatDuration
screens/StatsExercisesScreen.tsx    → plusieurs fonctions + types
screens/StatsRepartitionScreen.tsx  → plusieurs fonctions + types
screens/StatsScreen.tsx             → computeGlobalKPIs, computeMotivationalPhrase, formatVolume
screens/StatsVolumeScreen.tsx       → plusieurs fonctions + types
```

## Découpage en sous-modules

### `statsTypes.ts` (~70 lignes)
**Tous les types/interfaces** du module. Importé par les autres sous-fichiers.
```ts
export type StatsPeriod = '1m' | '3m' | 'all'
export const PERIOD_LABELS: string[]
export interface GlobalKPIs { ... }
export interface DurationStats { ... }
export interface VolumeStats { ... }
export interface VolumeWeekEntry { ... }
export interface VolumeTopExercise { ... }
export interface MuscleRepartitionEntry { ... }
export interface ExercisePR { ... }
export interface ExerciseFrequency { ... }
export interface MuscleWeekEntry { ... }
export interface MuscleWeekHistoryEntry { ... }
export interface HeatmapDay { ... }  // ← utilisé par HeatmapCalendar.tsx
```

### `statsDateUtils.ts` (~25 lignes)
Helpers de date purs, internes au module stats. Utilisés par statsVolume et statsMuscle.
```ts
export function toDateKey(date: Date | number): string
export function labelToPeriod(label: string): StatsPeriod
// Fonction interne (non exportée, ou exportée pour les autres sous-fichiers)
export function getPeriodStart(period: StatsPeriod): number
```

### `statsKPIs.ts` (~120 lignes)
KPIs globaux, streaks, phrase motivationnelle.
```ts
// Interne
function getActiveDayStrings(histories): Set<string>
// Exports
export function computeGlobalKPIs(histories, sets, exercises): GlobalKPIs
export function computeCurrentStreak(histories): number
export function computeRecordStreak(histories): number
export function computeMotivationalPhrase(histories, sets, exercises): string
```
Dépendance interne : `computeMotivationalPhrase` appelle `computeCurrentStreak` et `formatVolume`.
⚠️ `formatVolume` est dans `statsVolume.ts` — il faudra soit l'importer cross-fichier, soit déplacer `formatVolume` dans `statsDateUtils.ts` ou un `statsFormatters.ts` séparé (à décider selon l'implémentation réelle).

### `statsDuration.ts` (~40 lignes)
Stats de durée des séances.
```ts
export function computeDurationStats(histories): DurationStats
export function formatDuration(minutes: number): string
```

### `statsVolume.ts` (~140 lignes)
Volume, calendrier heatmap, formatters.
```ts
export function computeVolumeStats(histories, sets, period): VolumeStats
export function computeCalendarData(histories): Map<string, number>
export function buildHeatmapData(histories): HeatmapDay[]
export function formatVolume(kg: number): string
```
Dépendance interne : `buildHeatmapData` appelle `computeCalendarData`.
Dépendance externe : appelle `getPeriodStart` de `statsDateUtils`.

### `statsMuscle.ts` (~120 lignes)
Distribution musculaire et sets par muscle.
```ts
// Interne
function getMondayOfCurrentWeek(): Date
// Exports
export function computeMuscleRepartition(histories, sets, exercises, period): MuscleRepartitionEntry[]
export function computeSetsPerMuscleWeek(histories, sets, exercises): MuscleWeekEntry[]
export function computeSetsPerMuscleHistory(histories, sets, exercises, weeks?): MuscleWeekHistoryEntry[]
```
Dépendance externe : appelle `getPeriodStart` de `statsDateUtils`.

### `statsPRs.ts` (~90 lignes)
PRs par exercice et fréquence.
```ts
export function computePRsByExercise(histories, sets, exercises): ExercisePR[]
export function computeTopExercisesByFrequency(histories, sets, exercises, n?): ExerciseFrequency[]
```

## Étapes

1. Lire entièrement `statsHelpers.ts` pour extraire le code exact
2. Créer `statsTypes.ts` — tous les types/interfaces + `PERIOD_LABELS`
3. Créer `statsDateUtils.ts` — `toDateKey`, `labelToPeriod`, `getPeriodStart`
4. Créer `statsDuration.ts` — `computeDurationStats`, `formatDuration`
5. Créer `statsVolume.ts` — `computeVolumeStats`, `computeCalendarData`, `buildHeatmapData`, `formatVolume`
6. Créer `statsMuscle.ts` — fonctions muscle + `getMondayOfCurrentWeek` interne
7. Créer `statsPRs.ts` — PRs + fréquence
8. Créer `statsKPIs.ts` — KPIs, streaks, motivation (en dernier car dépend de formatVolume)
9. Remplacer le contenu de `statsHelpers.ts` par un barrel :
   ```ts
   export * from './statsTypes'
   export * from './statsDateUtils'
   export * from './statsKPIs'
   export * from './statsDuration'
   export * from './statsVolume'
   export * from './statsMuscle'
   export * from './statsPRs'
   ```
10. `npx tsc --noEmit` → 0 erreur
11. `npm test -- --testPathPattern="statsHelpers"` → 0 fail

## Contraintes
- **NE PAS modifier** les fichiers importeurs (screens, components) — le barrel garantit la compatibilité
- **NE PAS modifier** `statsHelpers.test.ts`
- Conserver EXACTEMENT les signatures et noms d'exports
- Gérer les dépendances croisées entre sous-fichiers avec des imports locaux (ex: `statsKPIs.ts` importe `formatVolume` depuis `./statsVolume`)
- Pas de `any` TypeScript

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript
- `npm test -- --testPathPattern="statsHelpers"` → zéro fail
- `npm test` → zéro fail global

## Dépendances
Aucune dépendance sur Groupe A ou D. Peut être lancé en parallèle.

## Statut
⏳ En attente
