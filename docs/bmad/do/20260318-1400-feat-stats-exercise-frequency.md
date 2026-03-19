# feat(stats): Exercise Frequency Screen (#114)

**Date :** 2026-03-18
**Type :** feat
**Statut :** Done

## Fichiers créés
- `mobile/src/model/utils/exerciseFrequencyHelpers.ts` — Logique de calcul (types + `computeExerciseFrequency`)
- `mobile/src/screens/StatsExerciseFrequencyScreen.tsx` — Ecran principal avec withObservables + ChipSelector

## Fichiers modifiés
- `mobile/src/navigation/index.tsx` — Lazy import + route + Stack.Screen
- `mobile/src/screens/StatsScreen.tsx` — Tile dans STAT_BUTTONS (`bar-chart-outline`)
- `mobile/src/i18n/fr.ts` — `navigation.statsExerciseFrequency` + `stats.exerciseFrequency` + section `exerciseFrequency.*`
- `mobile/src/i18n/en.ts` — Idem en anglais

## Fonctionnalités
- Filtre par période : 30j / 90j / Tout (ChipSelector)
- Carte résumé : total exercices + plus fréquent + moins fréquent
- FlatList triée par fréquence décroissante : badge count + nom + muscles + trend icon
- Trend : comparaison 1ère vs 2ème moitié de la période (increasing/decreasing/stable)
- Détection des exercices négligés (>30 jours)

## Vérification
- `npx tsc --noEmit` : 0 erreurs liées à cette feature
- Tests Jest : échec global pré-existant (Babel config), non lié
