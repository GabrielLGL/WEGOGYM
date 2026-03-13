# Passe 4 — Bugs silencieux — 20260313-1823

## 🔴 CRITIQUES

### B1 — `removeFriend()` sans try-catch
**Fichier**: `mobile/src/hooks/useFriendManager.ts:74-81`
```typescript
const removeFriend = useCallback(async (friendCode: string) => {
  const snapshots = await database.get<FriendSnapshot>('friend_snapshots')...
  await database.write(async () => {
    await Promise.all(snapshots.map(s => s.destroyPermanently()))
  })
  // ← Pas de try-catch ! Si destroyPermanently() throw → rejet non géré
}, [])
```
Le caller `handleConfirmRemove` (LeaderboardScreen:141) n'a pas non plus de try-catch → crash possible.

## 🟡 WARNINGS

### B2 — `formatRelative()` strings i18n manquantes
**Fichier**: `mobile/src/screens/LeaderboardScreen.tsx:53-55`
```typescript
if (days === 0) return "aujourd'hui"  // hardcoded FR
if (days === 1) return 'hier'          // hardcoded FR
return `il y a ${days}j`              // hardcoded FR
```
L'app est bilingue FR/EN. Ces strings devraient utiliser `t.leaderboard.today`, `t.leaderboard.yesterday`, `t.leaderboard.daysAgo`.

### B3 — `getImportResultMessage()` appelé 2 fois dans le JSX
**Fichier**: `mobile/src/screens/LeaderboardScreen.tsx:369-371`
```tsx
{getImportResultMessage() !== null && (
  <Text ...>{getImportResultMessage()}</Text>   // ← double appel
```
Devrait être stocké dans une variable.

### B4 — `error` state de `useFriendManager` jamais consommé
**Fichier**: `mobile/src/screens/LeaderboardScreen.tsx:89`
```typescript
const { importFriend, removeFriend, isImporting } = useFriendManager()
// `error` destructuré mais absent → dead code dans le hook
```

## 🔵 SUGGESTIONS

### B5 — `Clipboard` depuis `react-native` (deprecated)
**Fichier**: `mobile/src/screens/LeaderboardScreen.tsx:20`
`Clipboard` de `react-native` est deprecated. Utiliser `expo-clipboard` à la place.

---
**Résumé**: 1 critique, 3 warnings, 1 suggestion
