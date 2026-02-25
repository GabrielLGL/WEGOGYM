# S01 — Schema v18 + Models User/Program

## Description
Ajouter les colonnes `user_level` et `user_goal` sur `users`, `equipment` et `frequency` sur `programs`. Bump schema v17 → v18.

## Tâches techniques
- [ ] `schema.ts` : version 17 → 18
- [ ] `schema.ts` : +`user_level` (string, optional) et `user_goal` (string, optional) sur `users`
- [ ] `schema.ts` : +`equipment` (string, optional) et `frequency` (number, optional) sur `programs`
- [ ] `User.ts` : +`@text('user_level') userLevel`, +`@text('user_goal') userGoal`
- [ ] `Program.ts` : +`@text('equipment') equipment`, +`@field('frequency') frequency`
- [ ] `npx tsc --noEmit` passe

## Critères d'acceptation
- [ ] Schema v18 avec 4 nouvelles colonnes
- [ ] Models en sync parfait avec le schema
- [ ] Zero erreur TypeScript
