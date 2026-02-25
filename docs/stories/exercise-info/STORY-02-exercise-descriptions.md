# STORY-02 — Descriptions texte + animation_key pour exercices de base

## Description
Creer un fichier de mapping contenant les descriptions d'execution (en francais) et les cles d'animation pour 20-30 exercices courants. Creer un helper de seed idempotent pour mettre a jour les exercices existants en base.

## Taches techniques
1. Creer `mobile/src/model/utils/exerciseDescriptions.ts`
2. Definir l'interface `ExerciseDescriptionData` (animationKey, description)
3. Ecrire le mapping `EXERCISE_DESCRIPTIONS` pour 20-30 exercices de base
4. Ecrire la fonction `seedExerciseDescriptions(database)` :
   - Fetch tous les exercices
   - Pour chaque match par nom, mettre a jour animation_key + description
   - Idempotent : ne re-ecrit pas si deja rempli
   - Utilise `database.write()` + `database.batch()`
5. Lancer `npx tsc --noEmit` → 0 erreur

## Criteres d'acceptation
- [ ] Fichier `exerciseDescriptions.ts` existe avec 20-30 entrees
- [ ] Descriptions en francais, 2-4 phrases, cues actionables
- [ ] Fonction `seedExerciseDescriptions` exporte et fonctionnelle
- [ ] Seed idempotent (appeler 2 fois ne cree pas de doublon)
- [ ] TypeScript compile sans erreur

## Estimation
S (30 min - 1h)

## Dependances
STORY-01 (schema v21 + model mis a jour)
