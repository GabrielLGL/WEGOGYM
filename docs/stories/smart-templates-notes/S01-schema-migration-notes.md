# S01 — Migration schema v18 : colonne notes sur exercises
> Feature: smart-templates-notes | Priorite: Must | Dependance: —

## Description
Ajouter la colonne `notes` (text, optional) sur la table `exercises` dans le schema WatermelonDB. Mettre a jour le modele Exercise en consequence.

## Fichiers modifies
- `mobile/src/model/schema.ts`
- `mobile/src/model/models/Exercise.ts`

## Taches techniques
1. Schema : version 17 → 18
2. Schema : ajouter `{ name: 'notes', type: 'string', isOptional: true }` dans la table `exercises`
3. Model Exercise : ajouter `@text('notes') notes?: string`
4. Verifier la sync schema/model

## Criteres d'acceptation
- [ ] Schema version = 18
- [ ] Colonne `notes` presente dans la table `exercises`
- [ ] Decorateur `@text('notes')` dans Exercise
- [ ] `npx tsc --noEmit` passe
- [ ] `npm test` passe (aucun test casse)
