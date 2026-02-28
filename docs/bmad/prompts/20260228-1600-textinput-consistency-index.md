# textinput-consistency — 20260228-1600

## Contexte

Suite au fix du flicker dans `WorkoutSummarySheet` (TextInput non-contrôlé + styles memoïsés + useCallback), 2 fichiers présentent les mêmes problèmes de performance.

## Index des groupes

| Groupe | Fichier | Problème | Sévérité |
|--------|---------|----------|----------|
| A | `mobile/src/screens/SettingsScreen.tsx` | `StyleSheet.create(~270 styles)` dans le body du composant, sans `useMemo` | 🔴 CRITIQUE |
| B | `mobile/src/components/WorkoutExerciseCard.tsx` | `useStyles(colors)` sans `useMemo` + note TextInput contrôlé | 🟡 MINEUR |

## Ordre d'exécution

Les deux groupes sont **indépendants** — peuvent être exécutés en **parallèle**.

## Exécution

```
Groupe A — SettingsScreen :
/do docs/bmad/prompts/20260228-1600-textinput-consistency-A.md

Groupe B — WorkoutExerciseCard :
/do docs/bmad/prompts/20260228-1600-textinput-consistency-B.md
```

## Pattern appliqué (référence : WorkoutSummarySheet)

1. `StyleSheet.create` → sortir du composant dans `createStyles(colors, ...)` en bas du fichier
2. `const styles = useMemo(() => createStyles(colors, ...), [colors, ...])`
3. TextInput contrôlé → `useRef` + `defaultValue` + `onChangeText` sans `setState`
4. Handlers de sauvegarde → lisent le `ref.current` + `useCallback`

## Hors scope

`ExercisesScreen.tsx` — la search bar contrôlée est l'UX attendue ; `filteredExercises` est déjà memoïsé.
