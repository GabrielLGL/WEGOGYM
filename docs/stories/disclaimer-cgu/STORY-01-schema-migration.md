# STORY-01 — Migration schema v33 (disclaimer + CGU versioning)

## Description
Ajouter les colonnes `disclaimer_accepted` (boolean) et `cgu_version_accepted` (string) à la table `users`. Mettre à jour le model User et les constantes.

## Tâches techniques
1. `schema.ts` : bump v32 → v33, ajouter 2 colonnes dans `users`
2. `migrations.ts` : migration addColumns pour `users`
3. `models/User.ts` : ajouter `@field('disclaimer_accepted')` + `@text('cgu_version_accepted')`
4. `constants.ts` : ajouter `CGU_VERSION = '1.0'` et `CGU_URL = 'https://kore-app.net/cgu'`

## Critères d'acceptation
- [ ] Schema version = 33
- [ ] User model a `disclaimerAccepted` et `cguVersionAccepted`
- [ ] `npx tsc --noEmit` → 0 erreur
- [ ] `npm test` → 0 fail

## Estimation
XS (< 30 min)

## Dépendances
Aucune — première story à implémenter
