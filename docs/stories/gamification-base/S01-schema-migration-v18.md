# S01 — Migration schema v18 — Champs gamification

## Story
**En tant que** systeme,
**je veux** que le schema WatermelonDB soit migre en v18 avec les champs gamification sur `users`,
**afin que** les donnees XP, niveau, streak et tonnage soient persistees.

## Taches techniques
1. Modifier `mobile/src/model/schema.ts` : version 17 → 18, ajouter 7 colonnes sur `users`
2. Modifier `mobile/src/model/models/User.ts` : ajouter 7 decorateurs `@field`/`@text`
3. Verifier sync schema ↔ model parfait
4. `npx tsc --noEmit` → 0 erreur

## Colonnes ajoutees sur `users`
| Colonne | Type | Default | Description |
|---------|------|---------|-------------|
| `total_xp` | number | 0 | XP total accumule |
| `level` | number | 1 | Niveau actuel (cache) |
| `current_streak` | number | 0 | Streak semaines en cours |
| `best_streak` | number | 0 | Meilleur streak all-time |
| `streak_target` | number | 3 | Objectif seances/semaine |
| `total_tonnage` | number | 0 | Tonnage lifetime en kg |
| `last_workout_week` | string (optional) | null | Derniere semaine validee (ISO "YYYY-Www") |

## Criteres d'acceptation
- [ ] Schema version = 18
- [ ] 7 nouvelles colonnes sur `users`
- [ ] Model User avec 7 nouveaux decorateurs
- [ ] Schema ↔ Model en sync parfait
- [ ] `npx tsc --noEmit` passe

## Estimation
S (~30min)
