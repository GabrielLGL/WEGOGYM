# S01 — Helpers sets/muscle dans statsHelpers.ts

## Description
Ajouter deux fonctions pures dans `statsHelpers.ts` pour calculer les sets par groupe musculaire par semaine et leur évolution dans le temps.

## Fichiers à modifier
- `mobile/src/model/utils/statsHelpers.ts` — +2 types, +2 fonctions

## Types à ajouter

```typescript
export interface MuscleWeekEntry {
  muscle: string
  sets: number
}

export interface MuscleWeekHistoryEntry {
  weekLabel: string   // ex: "03/02"
  weekStart: number   // timestamp ms pour tri
  sets: number
}
```

## Fonctions à implémenter

### `computeSetsPerMuscleWeek(sets, exercises, histories)`
- Calcule le lundi de la semaine courante (00:00 heure locale)
- Filtre les histories actives (deleted_at null) dont `start_time >= lundi`
- Pour chaque set de ces histories : parse `exercise.muscles` (split `,`, trim)
- Compte les sets par muscle (1 set = 1 ligne dans `sets` table)
- Trie par sets décroissants
- Retourne max 8 entrées (`MuscleWeekEntry[]`)

### `computeSetsPerMuscleHistory(sets, exercises, histories, muscleFilter, weeks = 8)`
- Génère les `weeks` dernières semaines (lun → dim)
- Pour chaque semaine : compte les sets du `muscleFilter` dans les histories actives de cette plage
- Toujours retourner une entrée même si count = 0 (pas de trou dans le chart)
- Retourne `MuscleWeekHistoryEntry[]` trié chronologiquement

## Contraintes
- `exercise.muscles` peut être null/empty → traiter sans crash
- Parsing : `muscles.split(',').map(m => m.trim()).filter(Boolean)`
- Semaine courante : lundi 00:00 de la semaine ISO (getDay() ou calcul manuel)
- Pas de `any` TypeScript

## Critères d'acceptation
- [ ] `MuscleWeekEntry` et `MuscleWeekHistoryEntry` exportés depuis statsHelpers.ts
- [ ] `computeSetsPerMuscleWeek` retourne tableau trié, max 8, muscles réels de la semaine
- [ ] `computeSetsPerMuscleHistory` retourne 8 entrées avec valeurs 0 pour semaines vides
- [ ] Aucun crash si `exercise.muscles` est null ou vide
- [ ] `npx tsc --noEmit` → 0 erreur

## Estimation : S (1h)
## Dépendances : aucune
