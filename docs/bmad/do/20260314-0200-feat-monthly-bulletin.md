# feat(stats) — monthly bulletin screen — graded report card A/B/C/D by category
Date : 2026-03-14 02:00

## Instruction
docs/bmad/prompts/20260314-0200-sprint6-B.md

## Rapport source
description directe

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/monthlyBulletinHelpers.ts (NOUVEAU)
- mobile/src/model/utils/__tests__/monthlyBulletinHelpers.test.ts (NOUVEAU)
- mobile/src/screens/MonthlyBulletinScreen.tsx (NOUVEAU)
- mobile/src/navigation/index.tsx
- mobile/src/screens/StatsScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Nouveau helper `computeMonthlyBulletin` : calcule les 4 métriques (régularité, force, volume, équilibre) du mois courant, compare à la moyenne des mois précédents, attribue des notes A+/A/B+/B/C+/C/D selon les percentiles
- Nouveau écran `MonthlyBulletinScreen` : header avec note globale en grand, grille 2×2 de cartes de notes, card de commentaire, empty state si < 2 mois
- Navigation : route `MonthlyBulletin` ajoutée + lazy import
- StatsScreen : bouton "Bulletin" (school-outline) ajouté en dernier dans STAT_BUTTONS
- Traductions fr/en : sections `navigation.monthlyBulletin`, `stats.bulletin`, et section `bulletin.*` complète

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 7 passed (nouveau test monthlyBulletinHelpers)
- Nouveau test créé : oui

## Documentation mise à jour
aucune (feature autonome)

## Statut
✅ Résolu — 20260314-0200

## Commit
[sera rempli ci-après]
