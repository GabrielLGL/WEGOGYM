# feat(gamification) -- Systeme de Niveaux & Gamification de base
Date : 2026-02-25

## Feature
Systeme complet de gamification : XP par seance, niveaux (1-100), streak hebdomadaire, tonnage lifetime, celebrations milestones.
Features #100 (Niveaux/XP), #7 (Streak), #86 (Tonnage), #56 (Milestones).

## Stories implementees
| Story | Description |
|-------|-------------|
| S01 | Schema migration -- 7 colonnes gamification sur `users` |
| S02 | Helpers XP & Niveaux -- formule lineaire 80+7N, calculateLevel, xpToNextLevel |
| S03 | Helpers Streak -- getCurrentISOWeek, updateStreak, bestStreak tracking |
| S04 | Helpers Tonnage -- calculateSessionTonnage, formatTonnage (kg/t) |
| S05 | Integration fin de seance -- XP, niveau, tonnage, streak dans handleConfirmEnd |
| S06 | Composants visuels -- LevelBadge, XPProgressBar, StreakIndicator |
| S07 | Integration HomeScreen -- card gamification, KPI tonnage |
| S08 | Settings streak target -- boutons 2/3/4/5 seances/semaine |
| S09 | Milestones & Celebrations -- detectMilestones, MilestoneCelebration BottomSheet |

## Fichiers crees
- `mobile/src/model/utils/gamificationHelpers.ts` -- helpers XP, niveaux, streak, tonnage, milestones
- `mobile/src/model/utils/__tests__/gamificationHelpers.test.ts` -- 47 tests
- `mobile/src/components/LevelBadge.tsx` -- badge niveau avec etoile
- `mobile/src/components/XPProgressBar.tsx` -- barre de progression XP
- `mobile/src/components/StreakIndicator.tsx` -- indicateur streak
- `mobile/src/components/MilestoneCelebration.tsx` -- celebration BottomSheet

## Fichiers modifies
- `mobile/src/model/schema.ts` -- 7 colonnes ajoutees a `users` (v19, puis v20 par onboarding)
- `mobile/src/model/models/User.ts` -- 7 decorateurs gamification
- `mobile/src/screens/WorkoutScreen.tsx` -- gamification dans handleConfirmEnd + MilestoneCelebration
- `mobile/src/screens/HomeScreen.tsx` -- card gamification (LevelBadge, XPProgressBar, StreakIndicator) + KPI tonnage
- `mobile/src/screens/SettingsScreen.tsx` -- section Gamification avec streak target

## Decisions techniques cles
- **Formule XP lineaire** `80 + 7*N` au lieu de power law -- calibree pour ~500 seances (3 ans) pour atteindre niveau 100
- **Pas de XP retroactif** -- app pas encore lancee, tous les utilisateurs commencent au niveau 1
- **Streak par semaine ISO** -- comparaison via `YYYY-Www` pour gerer correctement les transitions d'annee
- **Milestones detectes par before/after** -- evite les re-triggers, affiche le premier detecte

## Verification
- TypeScript : OK (tsc clean)
- Tests : 1172 passed / 0 failed (65 suites)
- Tests gamification : 47 passed / 0 failed
- QA : 9/9 stories validees, fixes appliques (dead variable, haptic timing)
