# Rapport — Tips Contextuels (#30) — 20260314-0400

## Statut : DONE

## Changements

### Nouveau fichier
- `mobile/src/model/utils/workoutTipsHelpers.ts` — Base de tips par muscle + sélection déterministe via hash de l'exerciseId

### Fichiers modifiés
- `mobile/src/components/WorkoutExerciseCard.tsx` — Affiche un tip sous le nom de l'exercice (💡 + texte italic)
- `mobile/src/components/WorkoutSupersetBlock.tsx` — Idem pour les exercices en superset/circuit
- `mobile/src/i18n/fr.ts` — Section `workoutTips` (18 tips FR)
- `mobile/src/i18n/en.ts` — Section `workoutTips` (18 tips EN)

## Détails techniques
- Tips sélectionnés de manière **déterministe** (hash charCode de l'exerciceId) — pas de Math.random()
- Clés i18n plates (`pecs_0`, `dos_1`, etc.) — pas d'objet imbriqué
- Accès via cast `Record<string, string>` pour éviter les erreurs TS de navigation dynamique
- 11 groupes musculaires couverts + 3 tips génériques en fallback
- Discret : fontSize.caption, italic, pas de background

## TypeScript
- `npx tsc --noEmit` → zéro erreur liée à cette feature (erreurs pré-existantes sur StatsConstellationScreen)
