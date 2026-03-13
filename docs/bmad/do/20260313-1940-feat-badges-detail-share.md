# feat(badges) — badge detail sheet on press + share badge on long press
Date : 2026-03-13 19:40

## Instruction
docs/bmad/prompts/20260313-1930-finalisation-C.md
Fichiers : BadgeCard.tsx, BadgeCelebration.tsx, BadgesScreen.tsx + commit des docs

## Rapport source
docs/bmad/prompts/20260313-1930-finalisation-C.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/components/BadgeCard.tsx (modifié)
- mobile/src/components/BadgeCelebration.tsx (modifié)
- mobile/src/screens/BadgesScreen.tsx (modifié)
- docs/bmad/do/20260311-2200-leaderboard-amis-A.md (nouveau)
- docs/bmad/do/20260311-2200-leaderboard-amis-B.md (nouveau)
- docs/bmad/do/20260311-2200-leaderboard-amis-C.md (nouveau)
- docs/bmad/do/20260311-2215-badge-detail-A.md (nouveau)

## Ce qui a été fait
- BadgeCard.tsx : prop `onPress?` ajoutée, `disabled={!onPress && !onLongPress}`
- BadgeCelebration.tsx : bouton "Partager" + ViewShot off-screen + ShareBottomSheet (badge célébration)
- BadgesScreen.tsx : `handleBadgePress` (detail sheet pour tous), `handleBadgeLongPress` (share pour débloqués), `BadgeDetailContent` avec icône + description + condition 🎯 + statut, `getBadgeConditionText()` helper
- Docs leaderboard/badge : 4 rapports d'implémentation committés

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1734 passed (112 suites)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260313-1940

## Commit
f568b11 feat(badges): badge detail sheet on press + share badge on long press
1b0a958 docs(do): leaderboard amis + badge detail — rapports d'implémentation
