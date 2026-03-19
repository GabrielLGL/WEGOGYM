# feat(home) — flashback card — this week vs same period 1/3 months ago
Date : 2026-03-13 23:50

## Instruction
docs/bmad/prompts/20260313-2320-sprint4-A.md

## Rapport source
description directe (prompt)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/flashbackHelpers.ts` (nouveau)
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Création de `flashbackHelpers.ts` : fonction `computeFlashback(histories, sets, monthsAgo)` qui calcule les stats (sessions, volumeKg) d'une fenêtre ±3 jours autour de la date cible (1 ou 3 mois en arrière). Retourne `null` si aucune séance dans la fenêtre.
- Ajout du composant inline `FlashbackCard` dans `HomeScreen.tsx` (avant `HomeScreenBase`) : affiche une carte 2 colonnes (cette semaine vs période passée) avec deltas colorés (primary si positif, danger si négatif).
- Ajout de deux `useMemo` (`flashback1m`, `flashback3m`) dans `HomeScreenBase` utilisant les props existantes `histories` et `sets`.
- Insertion de `<FlashbackCard>` après `<WeeklyReportCard>` et avant la `<DeloadRecommendationCard>`, visible uniquement si au moins un flashback retourne des données.
- Traductions ajoutées dans `fr.ts` et `en.ts` : section `flashback` avec `title`, `monthAgo`, `threeMonthsAgo`, `thisWeek`, `sessions`, `noData`.
- Zéro nouvelle observable, zéro nouvelle dépendance npm.

## Vérification
- TypeScript : ✅ (erreur pré-existante dans navigation/index.tsx sur StatsHallOfFameScreen — hors scope)
- Tests : ✅ 9 passed (HomeScreen.test.tsx)
- Nouveau test créé : non (logique pure couverte par l'existant)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260313-2350

## Commit
a313e92 feat(home): flashback card — this week vs same period 1/3 months ago
