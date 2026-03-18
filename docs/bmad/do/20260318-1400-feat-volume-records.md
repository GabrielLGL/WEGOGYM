# feat(stats) — Records de volume
Date : 2026-03-18 14:00

## Instruction
docs/bmad/prompts/20260318-1400-sprint14-D.md

## Rapport source
docs/bmad/prompts/20260318-1400-sprint14-D.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/volumeRecordsHelpers.ts (NOUVEAU)
- mobile/src/screens/StatsVolumeRecordsScreen.tsx (NOUVEAU)
- mobile/src/navigation/index.tsx
- mobile/src/screens/StatsScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Créé `volumeRecordsHelpers.ts` : détecte les records de volume (meilleure séance, meilleure semaine, meilleur mois), calcule le volume lifetime, les moyennes, et la tendance récente (4 semaines)
- Créé `StatsVolumeRecordsScreen.tsx` : header avec volume total + moyennes, carte tendance, 3 cartes record avec barre de progression et badge "NOUVEAU RECORD" si la période en cours dépasse le record
- Ajouté la route `StatsVolumeRecords` dans navigation
- Ajouté le bouton dans la grille StatsScreen (icon: `trophy-outline`)
- Ajouté les traductions FR/EN complètes

## Vérification
- TypeScript : ✅
- Tests : ⚠️ Pré-existant — 123 suites fail (babel plugin `@nozbe/watermelondb/babel/plugin` manquant, non lié à ce changement)
- Nouveau test créé : non (issue babel bloquante pré-existante)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260318-1400

## Commit
(voir ci-dessous)
