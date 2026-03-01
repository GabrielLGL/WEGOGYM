# feat(exercise) — Infrastructure GIF exercice (expo-image + animationMap + ExerciseInfoSheet)
Date : 2026-03-01 08:30

## Instruction
docs/bmad/prompts/20260228-1930-exercise-gif-A.md

## Rapport source
docs/bmad/prompts/20260228-1930-exercise-gif-A.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/package.json` — ajout expo-image ~2.0.7
- `mobile/src/model/utils/animationMap.ts` — NOUVEAU (26/30 exercices mappés vers wger.de)
- `mobile/src/components/ExerciseInfoSheet.tsx` — placeholder → Image expo-image
- `mobile/src/i18n/fr.ts` — placeholderText → noAnimation
- `mobile/src/i18n/en.ts` — placeholderText → noAnimation
- `mobile/src/components/__tests__/ExerciseInfoSheet.test.tsx` — mise à jour des tests

## Ce qui a été fait
- Installé `expo-image ~2.0.7` (seule lib compatible Fabric/New Architecture pour les images)
- Créé `animationMap.ts` avec 26 URLs images wger.de pour les 30 animation keys existants
  (4 exercices sans image wger.de : lat_pulldown, romanian_deadlift, barbell_hip_thrust, face_pull → undefined → fallback icône)
- Modifié `ExerciseInfoSheet` : zone placeholder remplacée par `<Image>` expo-image
  - Si URL disponible dans ANIMATION_MAP → affiche l'image (contentFit=contain, cachePolicy=memory-disk)
  - Si pas d'URL → icône barbell + texte "Pas de démonstration disponible"
- Mis à jour fr.ts + en.ts : clé `placeholderText` → `noAnimation`
- Mis à jour le test ExerciseInfoSheet : mock expo-image, test fallback corrigé

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 8 passed (ExerciseInfoSheet), 1556 passed total
- Tests pré-existants en échec (non liés) : statsHelpers, statsKPIs (3 fails)
- Nouveau test créé : non (test existant mis à jour)

## Documentation mise à jour
Aucune (pattern standard, pas de nouveau pitfall)

## Statut
✅ Résolu — 20260301-0830

## Commit
[sera rempli après commit]
