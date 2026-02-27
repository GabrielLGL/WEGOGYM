<!-- v1.0 — 2026-02-27 -->
# Rapport — muscles-volume — Groupe A — 20260227-2215

## Objectif
Ajouter une fonction helper `computeWeeklySetsChart` dans `statsMuscle.ts` et les types associés dans `statsTypes.ts`.

Cette fonction calcule les données pour un graphique bar chart "séries par semaine" avec pagination (fenêtre de 4 semaines, déplaçable dans le temps).

## Fichiers concernés
- `mobile/src/model/utils/statsTypes.ts`
- `mobile/src/model/utils/statsMuscle.ts`

## Contexte technique
- Le projet est React Native + Expo 52 + TypeScript strict (pas de `any`)
- WatermelonDB : les mutations sont dans `database.write()` mais ici c'est du calcul pur, pas de mutation
- Les modèles `WorkoutSet`, `Exercise`, `History` sont importés via `type` depuis `../models/`
- `History.deletedAt` est `null` si non supprimé, sinon timestamp
- `History.startTime` est un `Date` (transformé par WatermelonDB)
- `WorkoutSet.history.id` et `WorkoutSet.exercise.id` sont des string IDs
- `Exercise.muscles` est `string[]` (tableau de noms de muscles)
- TypeScript strict : toutes les fonctions doivent avoir des types explicites, pas de `any`

## Interface attendue

### Types à ajouter dans `statsTypes.ts`

```typescript
export interface WeeklySetsChartResult {
  labels: string[]         // ex: ["03/02", "10/02", "17/02", "24/02"]
  data: number[]           // nombre de séries par semaine
  weekRangeLabel: string   // ex: "03/02 – 02/03" (label de la fenêtre affichée)
  hasPrev: boolean         // si des semaines existent avant cette fenêtre
  hasNext: boolean         // si des semaines existent après cette fenêtre (false si fenêtre la plus récente)
}
```

### Fonction à ajouter dans `statsMuscle.ts`

```typescript
export function computeWeeklySetsChart(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  options: {
    muscleFilter: string | null  // null = toutes muscles (overall)
    weekOffset: number           // 0 = 4 semaines les plus récentes, -1 = 4 semaines avant, etc.
    weeksToShow?: number         // défaut = 4
  }
): WeeklySetsChartResult
```

### Logique de la fonction

1. `weeksToShow = options.weeksToShow ?? 4`
2. Calculer la "fenêtre" : week courante (lundi → dimanche) = semaine d'index 0. L'offset recule dans le temps.
   - `weekOffset = 0` → 4 dernières semaines (semaine -3, -2, -1, courante)
   - `weekOffset = -1` → semaines -7, -6, -5, -4
   - Formule : la fenêtre commence à `(Math.abs(weekOffset) * weeksToShow + weeksToShow - 1)` semaines en arrière et va jusqu'à `(Math.abs(weekOffset) * weeksToShow)` semaines en arrière.
3. Pour chaque semaine de la fenêtre, calculer le nombre de séries (`sets.length`) qui :
   - appartiennent à une history active (non supprimée)
   - dont `startTime` est dans la plage de la semaine
   - si `muscleFilter` non null : `Exercise.muscles` contient ce muscle (trim + lowercase insensible)
4. `hasPrev = true` toujours (il peut y avoir des données plus anciennes — l'UI n'a pas moyen de savoir) sauf si weekOffset est déjà très en arrière... Pour simplifier : `hasPrev = weekOffset < -10` (10 fenêtres max). En pratique, retourner `hasPrev = true` toujours.
5. `hasNext = weekOffset < 0` (si on n'est pas sur la fenêtre la plus récente, on peut avancer)
6. `weekRangeLabel` : `"DD/MM – DD/MM"` (première semaine de la fenêtre → dernier jour de la dernière semaine)
7. `labels` : `"DD/MM"` du lundi de chaque semaine (ex: `"03/02"`)

**Calcul de "lundi de la semaine courante"** : utiliser `getMondayOfCurrentWeek()` déjà défini dans le fichier.

**Attention** : chaque semaine va du lundi (00:00:00) au lundi suivant (00:00:00 exclu).

### Exemple de sortie (weekOffset=0, weeksToShow=4, muscleFilter=null)
```
{
  labels: ["03/02", "10/02", "17/02", "24/02"],
  data: [12, 8, 0, 15],
  weekRangeLabel: "03/02 – 02/03",
  hasPrev: true,
  hasNext: false
}
```

## Étapes

1. Ouvrir `statsTypes.ts` et ajouter l'interface `WeeklySetsChartResult` après `MuscleWeekHistoryEntry`
2. Ouvrir `statsMuscle.ts` et ajouter la fonction `computeWeeklySetsChart` après `computeSetsPerMuscleHistory`
3. Vérifier que `WeeklySetsChartResult` est importé dans le fichier (il vient de `./statsTypes`)
4. S'assurer que `computeWeeklySetsChart` est exporté correctement
5. Vérifier que `statsHelpers.ts` (le barrel re-export) exporte aussi `computeWeeklySetsChart` et `WeeklySetsChartResult`

## Contraintes
- Ne pas modifier les fonctions existantes (`computeMuscleRepartition`, `computeSetsPerMuscleWeek`, `computeSetsPerMuscleHistory`)
- TypeScript strict : pas de `any`, types explicites sur tous les paramètres et retours
- La fonction doit être pure (pas de side effects, pas d'accès à `database`)
- Respecter le style existant : fonctions nommées, pas de classes, commentaires sparciaux

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript
- `npm test` → zéro fail
- La fonction `computeWeeklySetsChart` est accessible depuis `statsHelpers.ts`
- L'interface `WeeklySetsChartResult` est accessible depuis `statsHelpers.ts`

## Dépendances
Aucune dépendance sur d'autres groupes.

## Statut
✅ Résolu — 20260227-2220

## Résolution
Rapport do : docs/bmad/do/20260227-2220-feat-weekly-sets-chart-helper.md
