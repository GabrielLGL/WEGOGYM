# Passe 6 — Code mort & qualité — 20260313-1823

## Résultat global : ✅ QUASI-CLEAN

### Console.log ✅
Tous les `console.warn/log` dans les nouveaux fichiers sont correctement gardés avec `__DEV__`.

**Exception** : `shareService.ts:128` — console.warn avec eslint-disable-line commentaire. Acceptable (dans un `if (__DEV__)` block).

### TypeScript `any` ✅
Aucun `any` trouvé dans les nouveaux fichiers.

### Couleurs hardcodées ✅
Pas de couleurs hardcodées dans les nouveaux fichiers. Les tokens `colors.*` sont bien utilisés.

Seule exception connue : `colors.primary + '20'` dans ShareCard.tsx — pattern hex RGBA acceptable et cohérent avec le reste de la codebase.

## 🟡 WARNINGS

### Q1 — `error` state dans `useFriendManager` : dead code
**Fichier**: `mobile/src/hooks/useFriendManager.ts:17,67`
Le state `error` est défini et setté mais jamais consommé dans `LeaderboardScreen` (qui n'a pas `error` dans sa déstructuration). Dead code dans le hook.

### Q2 — `getImportResultMessage()` appelé 2 fois
**Fichier**: `mobile/src/screens/LeaderboardScreen.tsx:369-371`
Double appel à une fonction pure — mineur mais propre à optimiser.

## 🔵 SUGGESTIONS

### Q3 — `@field` au lieu de `@text` dans ProgressPhoto
**Fichier**: `mobile/src/model/models/ProgressPhoto.ts:13-15`
Voir rapport 05-watermelondb.md — convention uniquement.

### Q4 — `Clipboard` de `react-native` (deprecated)
**Fichier**: `mobile/src/screens/LeaderboardScreen.tsx:20,111`
API dépréciée. Fonctionnellement OK pour l'instant mais devrait migrer vers `expo-clipboard`.

---
**Score Qualité** : 0 critique, 2 warnings, 2 suggestions
