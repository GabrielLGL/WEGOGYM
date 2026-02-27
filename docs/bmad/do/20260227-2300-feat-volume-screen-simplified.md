# Rapport — Fusion Muscles+Volume → écran Volume simplifié

**Date :** 2026-02-27 23:00
**Type :** feat
**Status :** ✅ Complet

---

## Résumé

Fusion de `StatsRepartitionScreen` (Muscles) et `StatsVolumeScreen` en un seul écran Volume simplifié.
L'écran Volume affiche maintenant uniquement un BarChart de séries par période, filtrable par muscle.

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `mobile/src/model/utils/statsTypes.ts` | + interface `MonthlySetsChartResult` |
| `mobile/src/model/utils/statsMuscle.ts` | + fonction `computeMonthlySetsChart` |
| `mobile/src/navigation/index.tsx` | Retrait `StatsRepartition` de `RootStackParamList` + `Stack.Screen` + import |
| `mobile/src/screens/StatsScreen.tsx` | Retrait tuile "Muscles" de `STAT_BUTTONS` (7 → 6 boutons) |
| `mobile/src/screens/StatsVolumeScreen.tsx` | Réécriture complète |
| `mobile/src/screens/__tests__/StatsVolumeScreen.test.tsx` | Mise à jour tests (5 nouveaux tests) |
| `mobile/src/screens/__tests__/StatsScreen.test.tsx` | Mise à jour test (7 → 6 boutons, suppression attente "Muscles") |

---

## Détails techniques

### `computeMonthlySetsChart`
- Agrège les séries par mois calendaire
- Filtre par muscle si `muscleFilter !== null`
- Retourne au max les 12 derniers mois
- Labels FR : Jan, Fév, Mar, Avr, Mai, Juin, Juil, Aoû, Sep, Oct, Nov, Déc

### `StatsVolumeScreen` (nouvel écran)
- ChipSelector période : 1 mois (4 sem) / 3 mois (12 sem) / Tout (mensuel)
- ChipSelector muscle : Total + muscles entraînés triés
- BarChart avec labels clairsemés pour 12 semaines (1 sur 3)
- EmptyState "Aucune donnée pour cette période."

---

## Vérification

- `npx tsc --noEmit` : ✅ 0 erreur
- `npm test` : ✅ 1277/1277 tests passent
- `StatsRepartitionScreen.tsx` : conservé intact, non navigable
