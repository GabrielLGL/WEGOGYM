# DO — Exercise Animations Upload
**Date:** 2026-03-01 16:00
**Type:** chore
**Scope:** scripts, animationMap

## Résumé
Upload effectif des 29 images d'exercices vers Supabase Storage bucket `exercise-animations`.
Script `build-exercise-animations.mjs` lancé avec succès ; `animationMap.ts` mis à jour avec les URLs Supabase réelles.

## Problème rencontré
Le bucket avait été créé avec `allowed_mime_types: ["image/webp","image/gif"]`.
Toutes les images du dataset free-exercise-db étant en JPEG, le bucket rejetait les uploads avec `415 invalid_mime_type`.

## Fix appliqué
Mise à jour du bucket via l'API Supabase Storage (PUT /storage/v1/bucket/exercise-animations) avec le body snake_case correct :
```json
{"allowed_mime_types":["image/jpeg","image/jpg","image/png","image/gif","image/webp"]}
```
Note : l'API accepte `allowedMimeTypes` (camelCase) pour la réponse mais le PUT requiert `allowed_mime_types` (snake_case).

## Résultat
- 29/30 exercices uploadés (seul `bulgarian_split_squat` absent du dataset free-exercise-db)
- `animationMap.ts` — 29 URLs Supabase réelles + 1 `undefined`
- `npx tsc --noEmit` → zéro erreur

## Fichiers modifiés
- `mobile/src/model/utils/animationMap.ts` — URLs Supabase réelles (généré par le script)
- `scripts/build-log.txt` — log de l'exécution

## Vérification
```
[done] 29/30 exercises mapped successfully
npx tsc --noEmit → OK (no errors)
```
