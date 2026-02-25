# STORY-01 — Migration schema v21 : animation_key + description

## Description
Ajouter les colonnes `animation_key` (string, optional) et `description` (string, optional) sur la table `exercises` dans le schema WatermelonDB. Mettre a jour le model Exercise avec les decorateurs correspondants.

## Taches techniques
1. Modifier `mobile/src/model/schema.ts` : bump version 20 → 21, ajouter 2 colonnes sur `exercises`
2. Modifier `mobile/src/model/models/Exercise.ts` : ajouter `@text('animation_key') animationKey` et `@text('description') description`
3. Verifier sync schema <-> model (Known Pitfall)
4. Lancer `npx tsc --noEmit` → 0 erreur
5. Lancer `npm test` → 0 fail

## Criteres d'acceptation
- [ ] Schema version = 21
- [ ] Table exercises a les colonnes `animation_key` et `description` (isOptional: true)
- [ ] Model Exercise a `animationKey?: string` et `description?: string`
- [ ] TypeScript compile sans erreur
- [ ] Tests existants passent

## Estimation
XS (< 30 min)

## Dependances
Aucune
