# S03 — Helpers Streak hebdomadaire

## Story
**En tant que** systeme,
**je veux** un helper pour calculer et mettre a jour le streak hebdomadaire,
**afin que** la regularite du pratiquant soit trackee.

## Taches techniques
1. Ajouter dans `gamificationHelpers.ts` :
   - `getCurrentISOWeek()` : retourne la semaine ISO courante ("YYYY-Www")
   - `updateStreak(lastWorkoutWeek, currentStreak, bestStreak, streakTarget, currentWeekSessions, currentISOWeek)` : retourne `{ currentStreak, bestStreak, lastWorkoutWeek }`
2. Tests unitaires complets

## Logique
- Si `currentISOWeek === lastWorkoutWeek` : deja evalue cette semaine, ne rien faire
- Si la semaine precedente a ete validee ET `currentWeekSessions >= streakTarget` : streak + 1
- Si la semaine precedente n'a PAS ete validee : streak reset a 0 (ou 1 si semaine courante atteint l'objectif)
- `bestStreak = Math.max(bestStreak, currentStreak)`

## Criteres d'acceptation
- [ ] `getCurrentISOWeek()` retourne le bon format
- [ ] `updateStreak()` incremente correctement le streak
- [ ] Streak reset quand une semaine est manquee
- [ ] `bestStreak` garde le record
- [ ] Tests : streak normal, streak brise, best streak, meme semaine (no-op), changement d'objectif

## Depend de
- S01

## Estimation
S (~30min)
