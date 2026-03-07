# chore(eas) — configure submit.production.android
Date : 2026-03-07 18:00

## Instruction
docs/bmad/morning/20260306-0900-eas-submit-config.md ← bloc android

## Rapport source
docs/bmad/morning/20260306-0900-eas-submit-config.md

## Classification
Type : chore
Fichiers modifiés : mobile/eas.json, mobile/.gitignore

## Ce qui a été fait
- Ajout du bloc `android` dans `submit.production` de `eas.json` :
  - `serviceAccountKeyPath`: `./google-service-account.json`
  - `track`: `internal` (testing interne avant production)
  - `releaseStatus`: `draft`
- Ajout de `google-service-account.json` dans `.gitignore` pour éviter tout commit accidentel de la clé

## Vérification
- TypeScript : ✅
- Tests : ✅ 1589 passed
- Nouveau test créé : non (config JSON, pas de logique)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260307-1800

## Commit
8fd4286 chore(eas): configure submit.production.android for Play Store
