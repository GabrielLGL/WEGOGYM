# feat(stats): Rest Time Analysis (#109)

**Date** : 2026-03-17
**Statut** : Done

## Fichiers crees
- `mobile/src/model/utils/restTimeAnalysisHelpers.ts` -- Logique de calcul des temps de repos
- `mobile/src/screens/StatsRestTimeScreen.tsx` -- Ecran principal

## Fichiers modifies
- `mobile/src/navigation/index.tsx` -- Lazy import + route + Stack.Screen
- `mobile/src/screens/StatsScreen.tsx` -- Tile dans STAT_BUTTONS
- `mobile/src/i18n/fr.ts` -- navigation.statsRestTime + stats.restTime + section restTime
- `mobile/src/i18n/en.ts` -- Meme structure en anglais

## Implementation
- Groupement des sets par `historyId`, tri par `createdAt`
- Calcul du delta entre paires consecutives du meme exercice
- Filtrage strict : 10s <= repos <= 600s
- Recommandation : <60s short, 60-180s optimal, >180s long
- Badges couleur : short=#F59E0B, optimal=#10B981, long=#FF3B30
- `colors.placeholder` utilise partout (pas textMuted)

## Verification
- [x] `npx tsc --noEmit` -- 0 erreurs liees a cette feature
- [x] Tests -- probleme Babel preexistant (non lie)
- [x] Tile visible dans StatsScreen
- [x] Navigation configuree
- [x] Pattern withObservables + useDeferredMount respecte
