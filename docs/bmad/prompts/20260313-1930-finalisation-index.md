<!-- v1.0 — 2026-03-13 -->
# Prompt — Finalisation features pendantes — 20260313-1930

## Demande originale
Lancer 3 Claude instances pour commiter et valider les features déjà implémentées (Leaderboard Amis, Share, Badge Detail) qui sont dans le working tree mais pas encore committées.

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260313-1930-finalisation-A.md` | FriendSnapshot.ts, leaderboardHelpers.ts, seed.ts, navigation/index.tsx, HomeScreen.tsx, HomeScreen.test.tsx | 1 | ✅ |
| B | `docs/bmad/prompts/20260313-1930-finalisation-B.md` | ShareCard.tsx, ShareBottomSheet.tsx, shareService.ts, react-native-view-shot mock, WorkoutSummarySheet.tsx, jest.config.js | 1 | ✅ |
| C | `docs/bmad/prompts/20260313-1930-finalisation-C.md` | BadgeCard.tsx, BadgeCelebration.tsx, BadgesScreen.tsx + docs | 2 | ✅ |

## Ordre d'exécution

**Vague 1 — PARALLÈLE (lancer A et B en même temps) :**
- A et B n'ont aucun fichier en commun → zéro risque de conflit
- A fait : schéma Leaderboard data layer + HomeScreen tile
- B fait : Share components + WorkoutSummarySheet

**Vague 2 — APRÈS vague 1 (lancer C après A ET B) :**
- C dépend de B (BadgesScreen importe ShareBottomSheet + ShareCard)
- C fait : Badge detail on-press + Share badge on-long-press
- C commit aussi les docs (rapports leaderboard + badge-detail)

## État du working tree au départ

### Fichiers untracked (nouveaux) :
- `mobile/src/model/models/FriendSnapshot.ts` → Groupe A
- `mobile/src/model/utils/leaderboardHelpers.ts` → Groupe A
- `mobile/src/components/ShareCard.tsx` → Groupe B
- `mobile/src/components/ShareBottomSheet.tsx` → Groupe B
- `mobile/src/services/shareService.ts` → Groupe B
- `mobile/__mocks__/react-native-view-shot.js` → Groupe B

### Fichiers modifiés (staged dans git) :
- `mobile/src/model/seed.ts` → Groupe A
- `mobile/src/navigation/index.tsx` → Groupe A
- `mobile/src/screens/HomeScreen.tsx` → Groupe A
- `mobile/src/screens/__tests__/HomeScreen.test.tsx` → Groupe A
- `mobile/src/components/WorkoutSummarySheet.tsx` → Groupe B
- `mobile/jest.config.js` → Groupe B
- `mobile/src/components/BadgeCard.tsx` → Groupe C
- `mobile/src/components/BadgeCelebration.tsx` → Groupe C
- `mobile/src/screens/BadgesScreen.tsx` → Groupe C

### Déjà committés (ne pas retoucher) :
- `mobile/src/screens/LeaderboardScreen.tsx` ✅
- `mobile/src/hooks/useFriendManager.ts` ✅
- `mobile/src/i18n/fr.ts` + `en.ts` (sections leaderboard, share, badges.conditions) ✅
- `mobile/src/model/schema.ts` v37 ✅
- `mobile/src/model/migrations.ts` v37 ✅
