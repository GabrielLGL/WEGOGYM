<!-- v1.0 — 2026-03-11 -->
# Rapport — Leaderboard amis — Groupe B (i18n) — 20260311-2200

## Objectif
Ajouter toutes les clés de traduction nécessaires au leaderboard entre amis dans `fr.ts` et `en.ts`.

## Fichiers concernés
- `mobile/src/i18n/fr.ts` (MODIFIER — ajouter section `leaderboard`)
- `mobile/src/i18n/en.ts` (MODIFIER — ajouter section `leaderboard`)

## Contexte technique
- i18n custom léger (sans dépendance npm). `fr.ts` exporte `const fr = { ... }` (sans `as const`).
- `en.ts` importe `typeof fr` comme type et doit avoir exactement les mêmes clés.
- Si `fr.ts` a `as const`, `en.ts` ne peut pas l'implémenter (littéraux vs string). Ne PAS ajouter `as const`.
- Accès : `const { t } = useLanguage()` puis `t.leaderboard.title`.
- Lire les deux fichiers avant de les modifier pour identifier l'emplacement exact où insérer.

## Étapes

### 1. Lire fr.ts et en.ts pour identifier la fin de l'objet

Les fichiers font ~929 lignes. Trouver la dernière section avant la fermeture `}` et insérer la nouvelle section `leaderboard` après la dernière section existante.

### 2. Ajouter dans fr.ts

```typescript
leaderboard: {
  title: 'Classement',
  myCode: 'Mon code',
  shareCode: 'Partager mon code',
  addFriend: 'Ajouter un ami',
  importCode: 'Importer le code d\'un ami',
  importPlaceholder: 'Coller le code ici...',
  importButton: 'Importer',
  importSuccess: 'Ami ajouté !',
  importInvalid: 'Code invalide',
  importDuplicate: 'Ami déjà dans ta liste (stats mises à jour)',
  importSelf: 'C\'est ton propre code !',
  noFriends: 'Aucun ami pour l\'instant',
  noFriendsHint: 'Partage ton code avec tes amis pour les voir ici',
  rank: 'Rang',
  me: 'Moi',
  removeFriend: 'Retirer cet ami',
  removeFriendConfirm: 'Retirer cet ami du classement ?',
  sortBy: 'Trier par',
  sortXp: 'XP total',
  sortStreak: 'Streak',
  sortTonnage: 'Tonnage',
  sortPrs: 'Records (PRs)',
  level: 'Niv.',
  sessions: 'séances',
  lastUpdated: 'Mis à jour',
  howItWorks: 'Comment ça marche ?',
  howItWorksText: 'Partage ton code avec tes amis. Ils importent ton code pour te voir dans leur classement. Mets à jour en repartageant ton code.',
  copied: 'Code copié !',
  myStats: 'Mes stats partagées',
},
```

### 3. Ajouter dans en.ts (mêmes clés, traduction anglaise)

```typescript
leaderboard: {
  title: 'Leaderboard',
  myCode: 'My code',
  shareCode: 'Share my code',
  addFriend: 'Add a friend',
  importCode: 'Import a friend\'s code',
  importPlaceholder: 'Paste code here...',
  importButton: 'Import',
  importSuccess: 'Friend added!',
  importInvalid: 'Invalid code',
  importDuplicate: 'Friend already in your list (stats updated)',
  importSelf: 'That\'s your own code!',
  noFriends: 'No friends yet',
  noFriendsHint: 'Share your code with friends to see them here',
  rank: 'Rank',
  me: 'Me',
  removeFriend: 'Remove this friend',
  removeFriendConfirm: 'Remove this friend from the leaderboard?',
  sortBy: 'Sort by',
  sortXp: 'Total XP',
  sortStreak: 'Streak',
  sortTonnage: 'Tonnage',
  sortPrs: 'Personal Records',
  level: 'Lv.',
  sessions: 'sessions',
  lastUpdated: 'Updated',
  howItWorks: 'How does it work?',
  howItWorksText: 'Share your code with friends. They import your code to see you in their leaderboard. Update by resharing your code.',
  copied: 'Code copied!',
  myStats: 'My shared stats',
},
```

## Contraintes
- Ne PAS ajouter `as const` à fr.ts
- Exactement les mêmes clés dans fr.ts et en.ts (structure identique)
- Ne pas modifier les sections existantes (home, programs, stats, etc.)
- Insérer la section `leaderboard` juste avant la fermeture `}` de l'objet principal
- Respecter l'indentation existante (2 espaces)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript (en.ts doit satisfaire `typeof fr`)
- `npm test` → zéro fail
- `t.leaderboard.title` accessible sans erreur de type

## Dépendances
Aucune dépendance — ce groupe peut être lancé immédiatement en parallèle du groupe A.

## Statut
⏳ En attente
