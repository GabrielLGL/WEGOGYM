<!-- v1.0 — 2026-03-11 -->
# Prompt — Leaderboard entre amis — 20260311-2200

## Demande originale
`FINAL` Leaderboard entre amis

## Concept retenu : Offline-first via échange de codes
L'app est SQLite local — pas de backend. Le leaderboard fonctionne par **snapshots partageables** :
- Chaque utilisateur a un `friend_code` unique (ex: `KORE-A1B2C3`)
- Il partage son code (encodé base64 avec ses stats) via le Share sheet natif
- Son ami importe le code → snapshot stocké localement
- Le classement compare : moi + tous les amis importés
- Mise à jour : repartager son code = l'ami réimporte pour actualiser

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A — Data layer | `20260311-2200-leaderboard-amis-A.md` | schema.ts, User.ts, FriendSnapshot.ts, leaderboardHelpers.ts, useFriendManager.ts | 1 | ⏳ |
| B — i18n | `20260311-2200-leaderboard-amis-B.md` | fr.ts, en.ts | 1 | ⏳ |
| C — UI | `20260311-2200-leaderboard-amis-C.md` | LeaderboardScreen.tsx, navigation/index.tsx, HomeScreen.tsx | 2 | ⏳ |

## Ordre d'exécution
- **Vague 1** — A et B en parallèle (indépendants)
- **Vague 2** — C après A et B (utilise les models, helpers et clés i18n)

## Périmètre technique
- Schema : migration v35 → v36 (nouveau champ `friend_code` sur users + table `friend_snapshots`)
- Aucune dépendance npm nouvelle (btoa/atob natif, Share de react-native)
- Aucun backend requis — 100% offline
- Navigation : nouvelle route `Leaderboard` dans RootStackParamList
