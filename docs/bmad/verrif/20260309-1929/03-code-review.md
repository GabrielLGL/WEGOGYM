# Passe 3/8 — Code Review

## Résumé : 0 CRIT, 4 WARN, 3 SUGGESTIONS

### Violations détectées

| # | Sévérité | Fichier:Ligne | Problème |
|---|----------|---------------|----------|
| 1 | 🟡 WARN | `WorkoutScreen.tsx:211-215` | `handleClose` useCallback manque `summaryModal` dans les deps |
| 2 | 🟡 WARN | `HomeScreen.tsx:200` | Double cast `as keyof RootStackParamList as never` — type safety contournée |
| 3 | 🟡 WARN | `useWorkoutState.ts:58-77` | useEffect deps `[]` ignore changements sessionExercises (intentionnel, eslint-disable) |
| 4 | 🟡 WARN | `useWorkoutCompletion.ts:156` | Cast non sécurisé `as Record<string, number>` sur résultat SQL brut |
| 5 | 🔵 SUGG | `ChartsScreen.tsx:305-315` | 11 constantes magic number hors du thème |
| 6 | 🔵 SUGG | `HomeScreen.tsx:462,592-594` | Petites valeurs magiques (1-3px) dans les styles |
| 7 | 🔵 SUGG | `SessionDetailScreen.tsx:269` | contentContainerStyle inline au lieu de useStyles |
