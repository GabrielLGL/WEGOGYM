# feat(db) — vibrationEnabled + timerSoundEnabled dans User
Date : 2026-02-27 10:30

## Instruction
docs/bmad/prompts/20260227-1030-timer-son-A.md

## Rapport source
docs/bmad/prompts/20260227-1030-timer-son-A.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/schema.ts
- mobile/src/model/models/User.ts

## Ce qui a été fait
- `schema.ts` : version 24 → 25, ajout de `vibration_enabled` (boolean) et `timer_sound_enabled` (boolean) dans la table `users`, après `timer_enabled`
- `User.ts` : ajout de `@field('vibration_enabled') vibrationEnabled!: boolean` et `@field('timer_sound_enabled') timerSoundEnabled!: boolean` après `timerEnabled`
- Synchronisation schema ↔ modèle stricte respectée (Known Pitfalls)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1257 passed (7 échecs pré-existants dans ExercisePickerModal.test.tsx, non liés à ce changement)
- Nouveau test créé : non (changement DB pur, couvert par tsc)

## Documentation mise à jour
aucune (pattern standard @field, déjà documenté dans CLAUDE.md)

## Statut
✅ Résolu — 20260227-1030

## Commit
797d003 feat(db): add vibrationEnabled + timerSoundEnabled to User model (schema v25)
