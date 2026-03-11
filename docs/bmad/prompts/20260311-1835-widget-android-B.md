<!-- v1.0 — 2026-03-11 -->
# Rapport — Widget Android — Groupe B — Data Bridge — 20260311-1835

## Objectif
Créer un service qui extrait les données streak et prochain workout depuis WatermelonDB
et les persiste dans AsyncStorage pour que le widget Android puisse les lire.

## Fichiers concernés
- `mobile/src/services/widgetDataService.ts` — nouveau fichier
- `mobile/src/screens/HomeScreen.tsx` — appel du service à chaque mise à jour de données
- `mobile/src/model/utils/statsHelpers.ts` — lecture du code existant (pas de modif)

## Contexte technique
- Stack : WatermelonDB v35 (SQLite/JSI), React Native + Expo 52, TypeScript strict
- Les données DB sont réactives via `withObservables` — le widget doit être notifié quand les données changent
- `react-native-android-widget` expose `requestWidgetUpdate()` pour forcer le rafraîchissement du widget
- Les données sont passées au widget via les props au moment du render (voir Groupe C)
- AsyncStorage (`@react-native-async-storage/async-storage`) est déjà dispo dans le projet Expo
- Le streak est dans le modèle `User` : `currentStreak`, `bestStreak`, `streakTarget`, `lastWorkoutWeek`
- Le "prochain workout" = la session du programme actif à suivre chronologiquement après la dernière séance complétée

### Logique "prochain workout"
Pas de champ `current_program_id` en DB. Approche à implémenter :
1. Récupérer la dernière History complétée (`end_time IS NOT NULL`, `deleted_at IS NULL`, `is_abandoned = false`)
2. Trouver la session correspondante → son `program_id` → son `position`
3. Trouver la session de position suivante dans le même programme (modulo nombre de sessions)
4. Si aucune history → prendre la première session du premier programme (position 0)
5. Retourner `{ name: string, exerciseCount: number }` ou `null`

### Schéma DB v35 — tables utilisées
```
users: current_streak, best_streak, streak_target, last_workout_week, level
histories: session_id, start_time, end_time, deleted_at, is_abandoned
sessions: id, name, position, program_id
session_exercises: session_id (pour compter les exercices)
```

## Étapes

### 1. Créer `mobile/src/services/widgetDataService.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { requestWidgetUpdate } from 'react-native-android-widget'

const WIDGET_DATA_KEY = '@kore_widget_data'

export interface WidgetData {
  streak: number
  streakTarget: number
  level: number
  nextWorkoutName: string | null
  nextWorkoutExerciseCount: number
  lastUpdated: number // timestamp
}

// Persister les données pour le widget
export async function saveWidgetData(data: WidgetData): Promise<void> {
  await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data))
  // Déclencher le rafraîchissement du widget Android
  await requestWidgetUpdate({
    widgetName: 'KoreWidget',
    renderWidget: () => null, // sera overridé dans le task handler
    widgetNotFound: () => undefined,
  })
}

// Lire les données depuis AsyncStorage (appelé par le task handler)
export async function loadWidgetData(): Promise<WidgetData | null> {
  const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY)
  if (!raw) return null
  return JSON.parse(raw) as WidgetData
}
```

### 2. Créer la fonction `buildWidgetData(database)` dans le service

Prend `database` (instance WatermelonDB) en paramètre, exécute les queries, retourne `WidgetData`.

```typescript
export async function buildWidgetData(database: Database): Promise<WidgetData>
```

- Lire le `User` (first()) → streak, level
- Lire la dernière History complétée → trouver la prochaine Session
- Compter les `SessionExercise` de la prochaine session
- Retourner l'objet `WidgetData`

### 3. Mettre à jour HomeScreen.tsx

Dans `HomeScreen` (après chaque update des observables), appeler `buildWidgetData` + `saveWidgetData` dans un `useEffect` déclenché par les données :

```typescript
useEffect(() => {
  if (!user || !histories || !sessions) return
  buildWidgetData(database)
    .then(saveWidgetData)
    .catch(() => undefined) // silencieux — widget non critique
}, [user?.currentStreak, user?.level, histories?.length])
```

L'effet doit être non-bloquant et ne pas affecter l'UX. Les erreurs sont swallowed silencieusement.

## Contraintes
- Ne pas casser le rendu de HomeScreen.tsx (effect uniquement, pas de state change)
- WatermelonDB : queries de lecture seulement, pas de `database.write()` ici
- TypeScript strict : pas de `any`, typer toutes les queries
- Pas de `console.log` en production (utiliser `if (__DEV__) console.log(...)` si debug)
- Le service doit être pur (pas de side effects React) — uniquement async functions

## Critères de validation
- `cd mobile && npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail (HomScreen tests ne doivent pas régresser)
- `widgetDataService.ts` exporte bien `WidgetData`, `saveWidgetData`, `loadWidgetData`, `buildWidgetData`
- HomeScreen.tsx déclenche la mise à jour du widget sans régression visible

## Dépendances
Aucune dépendance sur les autres groupes (peut tourner en parallèle avec Groupe A).

## Statut
⏳ En attente
