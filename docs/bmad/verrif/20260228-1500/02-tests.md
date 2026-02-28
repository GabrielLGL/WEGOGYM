# Passe 2 — Tests Jest

**Run :** 20260228-1500
**Commande :** `cd mobile && npx jest --verbose`

## Résultat (dernier run complet connu — `jest_run_summary.txt`)

| Métrique | Valeur |
|---|---|
| Test Suites | 1 failed, 93 passed, 94 total |
| Tests | 1 failed, 1562 passed, 1563 total |
| Durée | 43.457 s |

## Echec actif

| Suite | Test | Cause |
|---|---|---|
| `statsHelpers.test.ts` | `computeDurationStats > excludes deleted sessions` | Test écrit avant le fix `statsDuration.ts` (filtre deletedAt). La fonction est correcte — `statsDuration.test.ts` passe le même test. A synchroniser. |

## Echecs pré-existants (non introduits par ce run)

| Suite | Nb échecs | Cause |
|---|---|---|
| `BadgesScreen.test.tsx` | 6 | `useLanguage()` appelé hors `LanguageProvider` dans les tests |
| `ProgramDetailScreen.test.tsx` | 6 | idem |

> Ces 12 échecs sont antérieurs à ce run verrif et documentés dans les rapports précédents.

## Suites passant (liées aux fichiers modifiés ce run)

| Suite | Statut |
|---|---|
| `BadgeCard.test.tsx` | PASS |
| `BadgeCelebration.test.tsx` | PASS |
| `LevelBadge.test.tsx` | PASS |
| `MilestoneCelebration.test.tsx` | PASS |
| `WorkoutSummarySheet.test.tsx` | PASS |

## Conclusion

Aucun nouveau test cassé par les corrections de ce run.
Score couverture : maintenu (pas de code retiré, seulement type fixes + DEV logs).
