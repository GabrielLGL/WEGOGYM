# Leaderboard amis — Groupe B (i18n)

## Statut : Terminé

## Date
2026-03-11 22:00

## Objectif
Ajouter la section `leaderboard` dans les fichiers i18n `fr.ts` et `en.ts`.

## Fichiers modifiés
- `mobile/src/i18n/fr.ts` — section `leaderboard` ajoutée (32 clés, FR)
- `mobile/src/i18n/en.ts` — section `leaderboard` ajoutée (32 clés, EN)

## Clés ajoutées (32 clés)
```
title, myCode, shareCode, addFriend, importCode, importPlaceholder,
importButton, importSuccess, importInvalid, importDuplicate, importSelf,
noFriends, noFriendsHint, rank, me, removeFriend, removeFriendConfirm,
sortBy, sortXp, sortStreak, sortTonnage, sortPrs, level, sessions,
lastUpdated, howItWorks, howItWorksText, copied, myStats
```

## Contraintes respectées
- `fr.ts` : pas de `as const` (export const fr = { ... })
- `en.ts` : `as const` conservé (export const en: typeof fr = { ... } as const)
- Structure identique dans les deux fichiers
- Sections existantes non modifiées
- Indentation 2 espaces respectée
- Insertion juste avant la fermeture `}` / `} as const`

## Validation TypeScript
`npx tsc --noEmit` : aucune erreur
